"use client";

import { useState } from "react";
import { createCashInvoice, createInstallmentPlan } from "@/app/actions";

interface Props {
  dbProducts: Array<{ id: string; name: string; price: number; stock: number }>;
  dbCustomers: Array<{ id: string; name: string; phoneNumber: string }>;
}

export default function PosClient({ dbProducts, dbCustomers }: Props) {
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isInstallmentMode, setIsInstallmentMode] = useState(false);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [months, setMonths] = useState<number>(12);
  const [loading, setLoading] = useState(false);

  const addToCart = (product: { id: string; name: string; price: number; stock: number }) => {
    if (product.stock <= 0) {
      alert("المنتج غير متوفر في المخزون");
      return;
    }
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert("الكمية المطلوبة تتجاوز المخزون المتاح");
        return;
      }
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCashCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const items = cart.map((c) => ({ productId: c.id, quantity: c.quantity, price: c.price }));
      await createCashInvoice(selectedCustomerId || null, items);
      alert("تم حفظ الفاتورة ودفع الكاش بنجاح!");
      setCart([]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const handleInstallmentCheckout = async () => {
    if (cart.length === 0) return;
    if (!selectedCustomerId) {
      alert("يرجى اختيار العميل أولاً لتقسيط الفاتورة");
      return;
    }
    setLoading(true);
    try {
      await createInstallmentPlan(selectedCustomerId, total, downPayment, months);
      alert("تم إنشاء خطة التقسيط للعميل بنجاح!");
      setCart([]);
      setIsInstallmentMode(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء تفعيل خطة التقسيط");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
      {/* Cart & Checkout Section */}
      <div className="card" style={{ border: "2px solid var(--primary)" }}>
        <h3 style={{ marginBottom: "16px", color: "var(--primary)" }}>الفاتورة الحالية</h3>

        {/* Customer Select */}
        <div className="input-group" style={{ marginBottom: "12px" }}>
          <label>اختر العميل (مطلوب للتقسيط)</label>
          <select
            className="input"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">-- عميل نقدي (بدون تسجيل) --</option>
            {dbCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phoneNumber})
              </option>
            ))}
          </select>
        </div>

        {cart.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", margin: "20px 0" }}>
            اضغط على المنتجات بالأسفل لإضافتها إلى الفاتورة
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
            {cart.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{item.name}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    {item.quantity} × {item.price.toLocaleString("ar-EG")} ج.م
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontWeight: "bold" }}>{(item.quantity * item.price).toLocaleString("ar-EG")} ج.م</div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "1rem" }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "1.25rem", fontWeight: "bold", color: "var(--primary)" }}>
              <span>الإجمالي:</span>
              <span>{total.toLocaleString("ar-EG")} ج.م</span>
            </div>
          </div>
        )}

        {/* Installment Form Overlay */}
        {isInstallmentMode ? (
          <div style={{ background: "var(--background)", padding: "12px", borderRadius: "var(--radius-md)", marginBottom: "12px" }}>
            <h4 style={{ marginBottom: "8px" }}>تفاصيل التقسيط</h4>
            <div className="input-group">
              <label>المقدم (ج.م)</label>
              <input
                type="number"
                className="input"
                value={downPayment}
                onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="input-group">
              <label>عدد الأشهر</label>
              <input
                type="number"
                className="input"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <div style={{ fontSize: "0.875rem", marginBottom: "12px", color: "var(--text-secondary)" }}>
              المتبقي للتقسيط: <strong>{(total - downPayment).toLocaleString("ar-EG")} ج.م</strong>
              <br />
              القسط الشهري: <strong>{months > 0 ? Math.round(((total - downPayment) / months) * 100) / 100 : 0} ج.م</strong>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-primary" disabled={loading} onClick={handleInstallmentCheckout}>
                {loading ? "جاري الإنشاء..." : "تأكيد بيع بالتقسيط"}
              </button>
              <button className="btn btn-secondary" onClick={() => setIsInstallmentMode(false)}>
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button className="btn btn-primary" disabled={cart.length === 0 || loading} onClick={handleCashCheckout}>
              {loading ? "جاري الدفع..." : "💵 دفع كاش كامل"}
            </button>
            <button className="btn btn-secondary" disabled={cart.length === 0 || loading} onClick={() => setIsInstallmentMode(true)}>
              📝 بيع بالتقسيط
            </button>
          </div>
        )}
      </div>

      {/* Available Products Section */}
      <div>
        <h3 style={{ marginBottom: "16px" }}>المنتجات المتاحة بالمخزن ({dbProducts.length})</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {dbProducts.map((product) => (
            <div
              key={product.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0",
                cursor: product.stock > 0 ? "pointer" : "not-allowed",
                opacity: product.stock > 0 ? 1 : 0.6,
              }}
              onClick={() => addToCart(product)}
            >
              <div>
                <h4 style={{ margin: 0, marginBottom: "4px" }}>{product.name}</h4>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  المخزون: {product.stock} قطع
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ fontWeight: "bold", color: "var(--primary)" }}>
                  {product.price.toLocaleString("ar-EG")} ج.م
                </div>
                <button
                  style={{
                    background: product.stock > 0 ? "var(--primary)" : "var(--text-secondary)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
