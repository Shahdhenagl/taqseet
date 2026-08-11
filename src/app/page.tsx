import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pendingInstallments = await prisma.installment.count({
    where: { isPaid: false },
  });

  const pendingPostponements = await prisma.postponementRequest.count({
    where: { status: "PENDING" },
  });

  const productsCount = await prisma.product.count();
  const customersCount = await prisma.customer.count();

  return (
    <div>
      <header style={{ marginBottom: "24px", paddingTop: "20px" }}>
        <h1 style={{ color: "var(--primary)", marginBottom: "8px" }}>نظام التقسيط والكاشير</h1>
        <p style={{ color: "var(--text-secondary)" }}>مرحباً بك، إليك ملخص اليوم</p>
      </header>

      {/* Main Alert Card */}
      <div className="card" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-hover))", color: "white" }}>
        <h3 style={{ marginBottom: "8px", opacity: 0.9 }}>الأقساط المستحقة القادمة والمتأخرة</h3>
        <div style={{ fontSize: "2.5rem", fontWeight: "bold" }}>{pendingInstallments}</div>
        <p style={{ marginTop: "8px", fontSize: "0.875rem", opacity: 0.8 }}>أقساط قيد التحصيل والمتابعة</p>
      </div>

      {/* Pending Postponement Notice if any */}
      {pendingPostponements > 0 && (
        <Link href="/customers" style={{ textDecoration: "none" }}>
          <div className="card" style={{ borderRight: "4px solid var(--warning)", background: "#FEF08A", color: "#713F12" }}>
            <h4 style={{ margin: 0, marginBottom: "4px" }}>⚠️ طلبات تأجيل جاري مراجعتها ({pendingPostponements})</h4>
            <p style={{ fontSize: "0.875rem", margin: 0 }}>يوجد طلبات تأجيل أقساط من العملاء تتطلب الموافقة أو الرفض.</p>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <Link href="/products" style={{ textDecoration: "none" }}>
          <div className="card" style={{ marginBottom: 0, textAlign: "center" }}>
            <h4 style={{ color: "var(--text-secondary)", marginBottom: "8px", fontSize: "0.875rem" }}>المنتجات بالمخزن</h4>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>{productsCount}</div>
          </div>
        </Link>

        <Link href="/customers" style={{ textDecoration: "none" }}>
          <div className="card" style={{ marginBottom: 0, textAlign: "center" }}>
            <h4 style={{ color: "var(--text-secondary)", marginBottom: "8px", fontSize: "0.875rem" }}>إجمالي العملاء</h4>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--secondary)" }}>{customersCount}</div>
          </div>
        </Link>
      </div>

      {/* Quick Action Navigation */}
      <h3 style={{ marginBottom: "16px" }}>إجراءات سريعة</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link href="/pos" className="btn btn-primary" style={{ textDecoration: "none", textAlign: "center" }}>
          🛒 فاتورة كاشير جديدة
        </Link>
        <Link href="/products" className="btn btn-secondary" style={{ textDecoration: "none", textAlign: "center" }}>
          ➕ إضافة منتج جديد
        </Link>
        <Link href="/customers" className="btn btn-secondary" style={{ textDecoration: "none", textAlign: "center" }}>
          👥 إدارة العملاء والأقساط
        </Link>
      </div>
    </div>
  );
}
