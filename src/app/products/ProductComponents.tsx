"use client";

import { useState } from "react";
import { addProduct } from "@/app/actions";

export function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addProduct(formData);
      setIsOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء إضافة المنتج");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary" style={{ width: "auto", padding: "8px 16px" }} onClick={() => setIsOpen(true)}>
        + إضافة منتج
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ color: "var(--primary)" }}>إضافة منتج / دراجة جديدة</h3>
              <button style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>اسم المنتج / الموديل</label>
                <input name="name" className="input" placeholder="دراجة نارية هوندا 150cc" required />
              </div>
              
              <div className="input-group">
                <label>السعر (ج.م)</label>
                <input name="price" type="number" step="0.01" className="input" placeholder="35000" required />
              </div>

              <div className="input-group">
                <label>الكمية المتاحة في المخزون</label>
                <input name="stock" type="number" className="input" defaultValue="1" required />
              </div>

              <div className="input-group">
                <label>وصف المنتج (اختياري)</label>
                <textarea name="description" className="input" rows={2} placeholder="المواصفات، اللون، رقم الشاسي..." />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "جاري الحفظ..." : "حفظ المنتج"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
