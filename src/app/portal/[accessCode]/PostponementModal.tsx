"use client";

import { useState } from "react";
import { requestPostponement } from "@/app/actions";

interface Props {
  accessCode: string;
  unpaidInstallments: Array<{ id: string; amount: number; dueDate: string }>;
}

export default function PostponementModal({ accessCode, unpaidInstallments }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(unpaidInstallments[0]?.id || "");
  const [requestedDate, setRequestedDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !requestedDate) return;

    setLoading(true);
    setMessage("");

    try {
      await requestPostponement(accessCode, selectedId, requestedDate, reason);
      setMessage("تم تقديم طلب التأجيل بنجاح! سيتم مراجعته من الإدارة.");
      setTimeout(() => {
        setIsOpen(false);
        setMessage("");
      }, 2000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "حدث خطأ أثناء تقديم الطلب";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (unpaidInstallments.length === 0) return null;

  return (
    <>
      <button 
        className="btn btn-secondary" 
        onClick={() => setIsOpen(true)}
        style={{ marginTop: '16px', background: 'rgba(79, 70, 229, 0.1)', borderColor: 'var(--primary)' }}
      >
        📅 تقديم طلب تأجيل قسط
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', margin: 0, backgroundColor: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--primary)' }}>طلب تأجيل قسط</h3>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {message && (
              <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', background: message.includes('بنجاح') ? '#DEF7EC' : '#FDE8E8', color: message.includes('بنجاح') ? '#03543F' : '#9B1C1C', fontSize: '0.875rem' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>اختر القسط المراد تأجيله</label>
                <select 
                  className="input" 
                  value={selectedId} 
                  onChange={(e) => setSelectedId(e.target.value)}
                  required
                >
                  {unpaidInstallments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      قسط {inst.amount} ج.م - موعده الأصلي: {new Date(inst.dueDate).toLocaleDateString('ar-EG')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>تاريخ الاستحقاق الجديد المطلوب</label>
                <input 
                  type="date" 
                  className="input" 
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>سبب التأجيل (اختياري)</label>
                <textarea 
                  className="input" 
                  rows={3} 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: ظروف خاصة هذا الشهر..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "جاري الإرسال..." : "إرسال الطلب"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
