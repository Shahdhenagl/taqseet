import { prisma } from "@/lib/prisma";
import { AddCustomerModal, AddPlanModal, PostponementActionCard, PayInstallmentButton } from "./CustomerComponents";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: {
      installments: {
        include: {
          installments: {
            orderBy: { dueDate: "asc" },
            include: { postponementRequests: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch pending postponement requests
  const pendingRequests = await prisma.postponementRequest.findMany({
    where: { status: "PENDING" },
    include: {
      installment: {
        include: {
          plan: {
            include: { customer: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div>
      <header style={{ marginBottom: "24px", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--primary)", margin: 0 }}>إدارة العملاء والأقساط</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <AddCustomerModal />
          <AddPlanModal customers={customers} />
        </div>
      </header>

      {/* Pending Postponement Requests Section */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ color: "var(--warning)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️ طلبات تأجيل الأقساط قيد الانتظار ({pendingRequests.length})</span>
          </h3>
          {pendingRequests.map((req) => (
            <PostponementActionCard key={req.id} request={req} />
          ))}
        </div>
      )}

      {/* Customer List */}
      <h3 style={{ marginBottom: "16px" }}>قائمة العملاء ({customers.length})</h3>

      {customers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-secondary)", padding: "30px 16px" }}>
          لا يوجد عملاء مضافون بعد. اضغط على إضافة عميل للبدء.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {customers.map((customer) => {
            const allInstallments = customer.installments.flatMap((p) => p.installments);
            const unpaid = allInstallments.filter((i) => !i.isPaid);
            const late = unpaid.filter((i) => new Date(i.dueDate) < now);
            const hasLateInstallments = late.length > 0;

            const portalUrl = `http://localhost:3000/portal/${customer.accessCode}`;
            const whatsappMessage = encodeURIComponent(
              `مرحباً ${customer.name}، يمكنك متابعة جدول أقساطك والمدفوعات الخاصة بك عبر الرابط التالي:\n${portalUrl}`
            );
            const whatsappLink = `https://wa.me/2${customer.whatsappNumber || customer.phoneNumber}?text=${whatsappMessage}`;

            return (
              <div key={customer.id} className="card" style={{ borderRight: hasLateInstallments ? "4px solid var(--danger)" : "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ margin: 0, marginBottom: "4px" }}>{customer.name}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      📞 {customer.phoneNumber}
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    {hasLateInstallments && (
                      <span style={{ backgroundColor: "var(--danger)", color: "white", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: "bold" }}>
                        {late.length} قسط متأخر
                      </span>
                    )}

                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.875rem", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                    >
                      <svg fill="currentColor" viewBox="0 0 24 24" style={{ width: "16px", height: "16px" }}>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      رابط البوابة
                    </a>
                  </div>
                </div>

                {/* Installments list for this customer */}
                {unpaid.length > 0 && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)" }}>
                    <h5 style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>الأقساط المستحقة القادمة:</h5>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {unpaid.slice(0, 3).map((inst) => {
                        const instOverdue = new Date(inst.dueDate) < now;
                        return (
                          <div key={inst.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--background)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
                            <div style={{ fontSize: "0.875rem" }}>
                              <strong style={{ color: instOverdue ? "var(--danger)" : "var(--text-primary)" }}>
                                {inst.amount.toLocaleString("ar-EG")} ج.م
                              </strong>
                              <span style={{ margin: "0 6px", color: "var(--text-secondary)" }}>•</span>
                              <span>تاريخ: {new Date(inst.dueDate).toLocaleDateString("ar-EG")}</span>
                            </div>
                            <PayInstallmentButton installmentId={inst.id} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
