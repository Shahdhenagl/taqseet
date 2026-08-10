"use client";

import { useState, useEffect } from "react";

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  
  // Mock data for now until we fetch from API
  useEffect(() => {
    setProducts([
      { id: '1', name: 'Honda 150cc', price: 35000, stock: 5 },
      { id: '2', name: 'Yamaha 200cc', price: 45000, stock: 2 },
      { id: '3', name: 'Suzuki 125cc', price: 28000, stock: 10 }
    ]);
  }, []);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div>
      <header style={{ marginBottom: '24px', paddingTop: '20px' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>نقطة البيع (الكاشير)</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        
        {/* Cart Section */}
        <div className="card" style={{ border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>الفاتورة الحالية</h3>
          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>الفاتورة فارغة</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>الكمية: {item.quantity} x {item.price} ج.م</div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{item.quantity * item.price} ج.م</div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                <span>الإجمالي:</span>
                <span>{total} ج.م</span>
              </div>
            </div>
          )}
          
          <button className="btn btn-primary" disabled={cart.length === 0} style={{ marginBottom: '12px' }}>
            دفع كاش
          </button>
          <button className="btn btn-secondary" disabled={cart.length === 0}>
            بيع بالتقسيط
          </button>
        </div>

        {/* Products Section */}
        <div>
          <h3 style={{ marginBottom: '16px' }}>المنتجات المتاحة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map(product => (
              <div key={product.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0', cursor: 'pointer' }} onClick={() => addToCart(product)}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '4px' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>المخزون: {product.stock}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{product.price} ج.م</div>
                  <button style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.2rem', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
