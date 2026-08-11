"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. Add Product
export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string || "1", 10);
  const description = formData.get("description") as string || "";

  if (!name || isNaN(price)) {
    throw new Error("بيانات المنتج غير مكتملة");
  }

  await prisma.product.create({
    data: {
      name,
      price,
      stock,
      description,
    },
  });

  revalidatePath("/products");
  revalidatePath("/pos");
}

// 2. Add Customer
export async function addCustomer(formData: FormData) {
  const name = formData.get("name") as string;
  const phoneNumber = formData.get("phoneNumber") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string || phoneNumber;

  if (!name || !phoneNumber) {
    throw new Error("بيانات العميل غير مكتملة");
  }

  const customer = await prisma.customer.create({
    data: {
      name,
      phoneNumber,
      whatsappNumber,
    },
  });

  revalidatePath("/customers");
  return customer;
}

// 3. Create Cash Invoice (POS)
export async function createCashInvoice(customerId: string | null, items: Array<{ productId: string; quantity: number; price: number }>) {
  if (!items || items.length === 0) {
    throw new Error("السلة فارغة");
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const invoice = await prisma.invoice.create({
    data: {
      totalAmount,
      isPaid: true,
      customerId: customerId || undefined,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  // Deduct stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  revalidatePath("/pos");
  revalidatePath("/products");
  revalidatePath("/");
  return invoice;
}

// 4. Create Installment Plan
export async function createInstallmentPlan(
  customerId: string,
  totalAmount: number,
  downPayment: number,
  months: number
) {
  if (!customerId || totalAmount <= 0 || months <= 0) {
    throw new Error("بيانات تقسيط غير صالحة");
  }

  if (downPayment > totalAmount) {
    throw new Error("المقدم لا يمكن أن يكون أكبر من إجمالي السعر");
  }

  const remainingAmount = totalAmount - downPayment;
  const baseMonthlyAmount = Math.floor((remainingAmount / months) * 100) / 100;
  const roundingDifference = Math.round((remainingAmount - baseMonthlyAmount * months) * 100) / 100;

  // Generate due dates
  const installmentsData = [];
  const now = new Date();

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(now.getFullYear(), now.getMonth() + i, now.getDate());
    const amount = i === months ? baseMonthlyAmount + roundingDifference : baseMonthlyAmount;
    installmentsData.push({
      amount: Math.round(amount * 100) / 100,
      dueDate,
      isPaid: false,
    });
  }

  const plan = await prisma.installmentPlan.create({
    data: {
      customerId,
      totalAmount,
      downPayment,
      remainingAmount,
      installments: {
        create: installmentsData,
      },
    },
  });

  revalidatePath("/customers");
  revalidatePath("/pos");
  revalidatePath("/");
  return plan;
}

// 5. Pay Installment
export async function payInstallment(installmentId: string) {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { plan: true },
  });

  if (!installment) {
    throw new Error("القسط غير موجود");
  }

  if (installment.isPaid) {
    throw new Error("هذا القسط مدفوع بالفعل");
  }

  // Update installment
  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      isPaid: true,
      paidDate: new Date(),
    },
  });

  // Deduct from plan remaining amount
  await prisma.installmentPlan.update({
    where: { id: installment.planId },
    data: {
      remainingAmount: { decrement: installment.amount },
    },
  });

  revalidatePath("/customers");
  revalidatePath("/");
}

// 6. Request Postponement (Customer Action)
export async function requestPostponement(
  accessCode: string,
  installmentId: string,
  requestedDueDateStr: string,
  reason?: string
) {
  const customer = await prisma.customer.findUnique({
    where: { accessCode },
  });

  if (!customer) {
    throw new Error("رمز الوصول للعميل غير صحيح");
  }

  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { plan: true },
  });

  if (!installment || installment.plan.customerId !== customer.id) {
    throw new Error("القسط غير موجود أو لا يخص هذا العميل");
  }

  if (installment.isPaid) {
    throw new Error("لا يمكن طلب تأجيل قسط تم سداده بالفعل");
  }

  const existingPending = await prisma.postponementRequest.findFirst({
    where: { installmentId, status: "PENDING" },
  });

  if (existingPending) {
    throw new Error("يوجد طلب تأجيل قيد المراجعة بالفعل لهذا القسط");
  }

  const requestedDueDate = new Date(requestedDueDateStr);
  if (isNaN(requestedDueDate.getTime())) {
    throw new Error("تاريخ التأجيل غير صالح");
  }

  const request = await prisma.postponementRequest.create({
    data: {
      installmentId,
      requestedDueDate,
      reason,
      status: "PENDING",
    },
  });

  revalidatePath(`/portal/${accessCode}`);
  revalidatePath("/customers");
  return request;
}

// 7. Handle Postponement Request (Admin Action)
export async function handlePostponementRequest(
  requestId: string,
  action: "APPROVED" | "REJECTED",
  extraFee: number = 0
) {
  const req = await prisma.postponementRequest.findUnique({
    where: { id: requestId },
    include: { installment: { include: { plan: true } } },
  });

  if (!req) {
    throw new Error("طلب التأجيل غير موجود");
  }

  if (action === "APPROVED") {
    // 1. Update request status
    await prisma.postponementRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        extraFee,
      },
    });

    // 2. Update installment due date and add extra interest/fee to amount
    const newAmount = req.installment.amount + extraFee;
    await prisma.installment.update({
      where: { id: req.installmentId },
      data: {
        dueDate: req.requestedDueDate,
        amount: newAmount,
      },
    });

    // 3. Update overall plan total & remaining amount
    await prisma.installmentPlan.update({
      where: { id: req.installment.planId },
      data: {
        totalAmount: { increment: extraFee },
        remainingAmount: { increment: extraFee },
      },
    });
  } else {
    await prisma.postponementRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
      },
    });
  }

  revalidatePath("/customers");
}
