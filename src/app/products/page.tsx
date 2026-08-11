import { prisma } from "@/lib/prisma";
import { AddProductModal } from "./ProductComponents";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <header style={{ marginBottom: "24px", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "var(--primary)", margin: 0 }}>إدارة المنتجات والمخزون</h1>
        <AddProductModal />
      </header>

      {products.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
          لا توجد منتجات حالياً. أضف دراجة نارية جديدة للبدء.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {products.map((product) => (
            <div key={product.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, marginBottom: "4px" }}>{product.name}</h3>
                {product.description && (
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    {product.description}
                  </p>
                )}
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: product.stock > 0 ? "#DEF7EC" : "#FDE8E8",
                    color: product.stock > 0 ? "#03543F" : "#9B1C1C",
                    fontWeight: "bold",
                  }}
                >
                  المخزون: {product.stock} قطع
                </span>
              </div>
              <div style={{ fontWeight: "bold", fontSize: "1.25rem", color: "var(--primary)" }}>
                {product.price.toLocaleString("ar-EG")} ج.م
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
