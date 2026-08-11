import { prisma } from "@/lib/prisma";
import PostponementModal from "./PostponementModal";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ accessCode: string }>;
}

export default async function CustomerPortalPage({ params }: PageProps) {
  const { accessCode } = await params;

  const customer = await prisma.customer.findUnique({
    where: { accessCode },
    include: {
      installments: {
        include: {
          installments: {
            orderBy: { dueDate: "asc" },
            include: { postponementRequests: { orderBy: { createdAt: "desc" } } },
          },
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  type PostponementReq = {
    id: string;
    status: string;
    extraFee: number;
  };

  type InstallmentWithReqs = {
    id: string;
    amount: number;
    dueDate: Date;
    isPaid: boolean;
    postponementRequests: PostponementReq[];
  };

  // Calculate totals across all plans
  let totalAmount = 0;
  let remainingAmount = 0;
  const allInstallments: InstallmentWithReqs[] = [];

  customer.installments.forEach((plan) => {
    totalAmount += plan.totalAmount;
    remainingAmount += plan.remainingAmount;
    plan.installments.forEach((inst) => {
      allInstallments.push(inst);
    });
  });

  const paidAmount = totalAmount - remainingAmount;
  const now = new Date();

  const unpaidInstallmentsForModal = allInstallments
    .filter((inst) => !inst.isPaid)
    .map((inst) => ({
      id: inst.id,
      amount: inst.amount,
      dueDate: inst.dueDate.toISOString(),
    }));

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Header */}
      <header style={{ marginBottom: "24px", paddingTop: "20px", textAlign: "center" }}>
        <h1 style={{ color: "var(--primary)", fontSize: "1.75rem", marginBottom: "4px" }}>
          حسابي والمتابعة
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          مرحباً بك، <strong style={{ color: "var(--text-primary)" }}>{customer.name}</strong>
        </p>
      </header>

      {/* Overview Stats Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, var(--primary), var(--primary-hover))",
          color: "white",
          boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.4)",
        }}
      >
        <div style={{ fontSize: "0.875rem", opacity: 0.9, marginBottom: "4px" }}>المبلغ المتبقي للأقساط</div>
        <div style={{ fontSize: "2.25rem", fontWeight: "bold" }}>{remainingAmount.toLocaleString("ar-EG")} ج.م</div>
        
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.2)", fontSize: "0.875rem" }}>
          <div>
            <span style={{ opacity: 0.8 }}>إجمالي الخطة: </span>
            <strong>{totalAmount.toLocaleString("ar-EG")} ج.م</strong>
          </div>
          <div>
            <span style={{ opacity: 0.8 }}>تم سداد: </span>
            <strong style={{ color: "#A7F3D0" }}>{paidAmount.toLocaleString("ar-EG")} ج.م</strong>
          </div>
        </div>
      </div>

      {/* Postponement Modal Button */}
      <PostponementModal accessCode={accessCode} unpaidInstallments={unpaidInstallmentsForModal} />

      {/* Installments Breakdown List */}
      <div style={{ marginTop: "24px" }}>
        <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>جدول الأقساط</h3>

        {allInstallments.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
            لا توجد أقساط مسجلة حالياً.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {allInstallments.map((inst, index) => {
              const isOverdue = !inst.isPaid && new Date(inst.dueDate) < now;
              const pendingReq = inst.postponementRequests.find((r) => r.status === "PENDING");
              const approvedReq = inst.postponementRequests.find((r) => r.status === "APPROVED");

              return (
                <div
                  key={inst.id}
                  className="card"
                  style={{
                    marginBottom: 0,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRight: inst.isPaid
                      ? "4px solid var(--secondary)"
                      : isOverdue
                      ? "4px solid var(--danger)"
                      : "4px solid var(--warning)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "1rem", marginBottom: "4px" }}>
                      القسط #{index + 1} - {inst.amount.toLocaleString("ar-EG")} ج.م
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      تاريخ الاستحقاق: {new Date(inst.dueDate).toLocaleDateString("ar-EG")}
                    </div>

                    {pendingReq && (
                      <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "var(--warning)", fontWeight: "bold" }}>
                        ⏳ يوجد طلب تأجيل قيد المراجعة
                      </div>
                    )}
                    {approvedReq && (
                      <div style={{ marginTop: "6px", fontSize: "0.75rem", color: "var(--primary)", fontWeight: "bold" }}>
                        ✓ تم تأجيل القسط (+{approvedReq.extraFee} ج.م فائدة)
                      </div>
                    )}
                  </div>

                  <div>
                    {inst.isPaid ? (
                      <span style={{ background: "#DEF7EC", color: "#03543F", padding: "6px 12px", borderRadius: "var(--radius-full)", fontSize: "0.875rem", fontWeight: "bold" }}>
                        مدفوع
                      </span>
                    ) : isOverdue ? (
                      <span style={{ background: "#FDE8E8", color: "#9B1C1C", padding: "6px 12px", borderRadius: "var(--radius-full)", fontSize: "0.875rem", fontWeight: "bold" }}>
                        متأخر
                      </span>
                    ) : (
                      <span style={{ background: "#FEF08A", color: "#713F12", padding: "6px 12px", borderRadius: "var(--radius-full)", fontSize: "0.875rem", fontWeight: "bold" }}>
                        قادم
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
