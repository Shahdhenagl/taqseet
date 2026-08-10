import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch real data from DB
  const pendingInstallments = await prisma.installment.count({
    where: { isPaid: false }
  });
  
  const productsCount = await prisma.product.count();
  const customersCount = await prisma.customer.count();

  return (
    <div>
      <header style={{ marginBottom: '24px', paddingTop: '20px' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '8px' }}>نظام التقسيط والكاشير</h1>
        <p style={{ color: 'var(--text-secondary)' }}>مرحباً بك، إليك ملخص اليوم</p>
      </header>

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))', color: 'white' }}>
        <h3 style={{ marginBottom: '8px', opacity: 0.9 }}>الأقساط المتأخرة</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{pendingInstallments}</div>
        <p style={{ marginTop: '8px', fontSize: '0.875rem', opacity: 0.8 }}>أقساط تحتاج للمتابعة هذا الأسبوع</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem' }}>المنتجات</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{productsCount}</div>
        </div>
        <div className="card" style={{ marginBottom: 0, textAlign: 'center' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem' }}>العملاء</h4>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{customersCount}</div>
        </div>
      </div>

      <h3 style={{ marginBottom: '16px' }}>إجراءات سريعة</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button className="btn btn-primary">فاتورة كاشير جديدة</button>
        <button className="btn btn-secondary">إضافة منتج جديد</button>
      </div>
    </div>
  );
}
