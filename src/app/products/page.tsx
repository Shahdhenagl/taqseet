import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <header style={{ marginBottom: '24px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>المنتجات</h1>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>إضافة</button>
      </header>

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          لا توجد منتجات حالياً. أضف دراجة نارية جديدة للبدء.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.map((product: any) => (
            <div key={product.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: '4px' }}>{product.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>المخزون: {product.stock}</p>
              </div>
              <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                {product.price} ج.م
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
