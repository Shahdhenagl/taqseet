"use client";

import { useState } from "react";
import { addCustomer, payInstallment, handlePostponementRequest, createInstallmentPlan } from "@/app/actions";

interface CustomerOption {
  id: string;
  name: string;
  phoneNumber: string;
}

interface PostponementReqData {
  id: string;
  requestedDueDate: Date;
  reason?: string | null;
  installment: {
    amount: number;
    dueDate: Date;
    plan: {
      customer: {
        name: string;
        phoneNumber: string;
      };
    };
  };
}

// 1. Add Customer Modal
export function AddCustomerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addCustomer(formData);
      setIsOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "خطأ أثناء إضافة العميل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary" style={{ width: "auto", padding: "8px 16px" }} onClick={() => setIsOpen(true)}>
        + إضافة عميل
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ color: "var(--primary)" }}>إضافة عميل جديد</h3>
              <button style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>اسم العميل بالكامل</label>
                <input name="name" className="input" placeholder="أحمد محمد" required />
              </div>
              <div className="input-group">
                <label>رقم الهاتف</label>
                <input name="phoneNumber" className="input" placeholder="01012345678" required />
              </div>
              <div className="input-group">
                <label>رقم الواتساب (اختياري)</label>
                <input name="whatsappNumber" className="input" placeholder="01012345678" />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "جاري الحفظ..." : "حفظ العميل"}
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

// 2. Add Installment Plan Modal
export function AddPlanModal({ customers }: { customers: CustomerOption[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const [totalAmount, setTotalAmount] = useState<number>(30000);
  const [downPayment, setDownPayment] = useState<number>(5000);
  const [months, setMonths] = useState<number>(12);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    try {
      await createInstallmentPlan(customerId, totalAmount, downPayment, months);
      setIsOpen(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء تقسيط الدراجة/المنتج");
    } finally {
      setLoading(false);
    }
  };

  if (customers.length === 0) return null;

  return (
    <>
      <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 16px" }} onClick={() => setIsOpen(true)}>
        + تقسيط جديد
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "450px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ color: "var(--primary)" }}>إنشاء خطة تقسيط جديدة</h3>
              <button style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>اختر العميل</label>
                <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phoneNumber})</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>إجمالي سعر البيع (ج.م)</label>
                <input type="number" className="input" value={totalAmount} onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)} required />
              </div>

              <div className="input-group">
                <label>المقدم المدفوع (ج.م)</label>
                <input type="number" className="input" value={downPayment} onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)} required />
              </div>

              <div className="input-group">
                <label>عدد الأشهر (الأقساط)</label>
                <input type="number" className="input" min="1" max="48" value={months} onChange={(e) => setMonths(parseInt(e.target.value, 10) || 1)} required />
              </div>

              <div style={{ padding: "10px", background: "var(--background)", borderRadius: "var(--radius-sm)", marginBottom: "16px", fontSize: "0.875rem" }}>
                <div>المبلغ المتبقي: <strong>{(totalAmount - downPayment).toLocaleString("ar-EG")} ج.م</strong></div>
                <div>قيمة القسط الشهري: <strong>{months > 0 ? Math.round(((totalAmount - downPayment) / months) * 100) / 100 : 0} ج.م</strong></div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "جاري التجديد..." : "تأكيد خطة التقسيط"}
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

// 3. Postponement Action Row
export function PostponementActionCard({ request }: { request: PostponementReqData }) {
  const [extraFee, setExtraFee] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    setLoading(true);
    try {
      await handlePostponementRequest(request.id, action, extraFee);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء معالجة الطلب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ borderRight: "4px solid var(--warning)", marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <h4 style={{ margin: 0 }}>العميل: {request.installment.plan.customer.name}</h4>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            هاتف: {request.installment.plan.customer.phoneNumber}
          </p>
        </div>
        <span style={{ background: "#FEF08A", color: "#713F12", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: "bold" }}>
          طلب تأجيل
        </span>
      </div>

      <div style={{ fontSize: "0.875rem", marginBottom: "12px", background: "var(--background)", padding: "10px", borderRadius: "var(--radius-sm)" }}>
        <div>قيمة القسط: <strong>{request.installment.amount} ج.م</strong></div>
        <div>الموعد الحالي: {new Date(request.installment.dueDate).toLocaleDateString("ar-EG")}</div>
        <div style={{ color: "var(--primary)", fontWeight: "bold" }}>
          الموعد المطلوب: {new Date(request.requestedDueDate).toLocaleDateString("ar-EG")}
        </div>
        {request.reason && <div style={{ marginTop: "4px", fontStyle: "italic" }}>السبب: {request.reason}</div>}
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <input
            type="number"
            className="input"
            style={{ padding: "8px 12px", fontSize: "0.875rem" }}
            placeholder="الفائدة المضافة (ج.م)"
            value={extraFee}
            onChange={(e) => setExtraFee(parseFloat(e.target.value) || 0)}
          />
        </div>
        <button className="btn btn-primary" style={{ width: "auto", padding: "8px 16px" }} disabled={loading} onClick={() => handleAction("APPROVED")}>
          موافقة (+{extraFee}ج)
        </button>
        <button className="btn btn-secondary" style={{ width: "auto", padding: "8px 16px", borderColor: "var(--danger)", color: "var(--danger)" }} disabled={loading} onClick={() => handleAction("REJECTED")}>
          رفض
        </button>
      </div>
    </div>
  );
}

// 4. Pay Installment Button Component
export function PayInstallmentButton({ installmentId }: { installmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!confirm("هل تم استلام المبلغ وتأكيد سداد هذا القسط؟")) return;
    setLoading(true);
    try {
      await payInstallment(installmentId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "حدث خطأ أثناء السداد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.75rem", width: "auto" }} disabled={loading} onClick={handlePay}>
      {loading ? "جاري السداد..." : "تسجيل سداد"}
    </button>
  );
}
