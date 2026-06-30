import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

const STATUS = {
  pending:          { key:'pending',         icon:'🕐', color:'#f59e0b', desc:'Your order has been received' },
  confirmed:        { key:'confirmed',        icon:'✅', color:'#3b82f6', desc:'Restaurant confirmed your order!' },
  preparing:        { key:'preparing',        icon:'👨‍🍳', color:'#8b5cf6', desc:'Chef is preparing your meal' },
  out_for_delivery: { key:'outForDelivery',   icon:'🚀', color:'#f97316', desc:'Your order is on the way!' },
  delivered:        { key:'delivered',        icon:'🎊', color:'#10b981', desc:'Enjoy your meal!' },
  cancelled:        { key:'cancelled',        icon:'❌', color:'#ef4444', desc:'Order was cancelled' },
};
const STEPS = ['pending','confirmed','preparing','out_for_delivery','delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isAdmin) { navigate(isAdmin ? "/admin/orders" : "/login"); return; }
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${id}`);
      setOrder(res.data);
    } catch { navigate('/orders'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}><Navbar/>
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}>Loading...</div>
    </div>
  );
  if (!order) return null;

  const info = STATUS[order.status] || STATUS.pending;
  const stepIdx = STEPS.indexOf(order.status);

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar/>
      <div style={{ padding:'30px 40px 60px' }} className="page-pad">
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'22px' }}>
          <button onClick={()=>navigate('/orders')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text2)', padding:'8px 16px', fontSize:'13px', cursor:'pointer', alignSelf:'flex-start' }}>
            {t.allOrders}
          </button>

          <div style={{ background:info.color+'12', borderRadius:'18px', padding:'26px 30px', border:`1px solid ${info.color}30`, display:'flex', alignItems:'center', gap:'22px' }}>
            <span style={{ fontSize:'50px' }}>{info.icon}</span>
            <div>
              <h2 style={{ color:info.color, fontSize:'22px', fontWeight:700 }}>{t[info.key]}</h2>
              <p style={{ color:'var(--text2)', marginTop:'4px', fontSize:'13px' }}>{info.desc}</p>
              <p style={{ color:'var(--text3)', fontSize:'12px', marginTop:'4px' }}>Order #{order._id.slice(-6).toUpperCase()} • Auto-refreshes every 15s</p>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'360px 1fr', gap:'22px', alignItems:'start' }} className="layout-2col">
            {order.status !== 'cancelled' && (
              <div style={{ background:'var(--card)', borderRadius:'16px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                <h3 style={{ color:'var(--text)', fontSize:'15px', fontWeight:700, marginBottom:'18px' }}>{t.orderProgress}</h3>
                {STEPS.map((step,idx)=>{
                  const si = STATUS[step];
                  const done = idx<=stepIdx;
                  const active = idx===stepIdx;
                  return (
                    <div key={step} style={{ display:'flex', gap:'14px', marginBottom:'4px' }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:done?si.color:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px', fontWeight:700, flexShrink:0, boxShadow:active?`0 0 14px ${si.color}50`:'none' }}>
                          {done?'✓':idx+1}
                        </div>
                        {idx<STEPS.length-1 && <div style={{ width:'2px', height:'44px', marginTop:'3px', background:idx<stepIdx?si.color:'var(--bg2)' }}/>}
                      </div>
                      <div style={{ paddingBottom:'28px' }}>
                        <p style={{ color:done?'var(--text)':'var(--text3)', fontWeight:done?600:400, fontSize:'14px' }}>{si.icon} {t[si.key]}</p>
                        <p style={{ color:'var(--text3)', fontSize:'12px', marginTop:'2px' }}>{si.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
              <div style={{ background:'var(--card)', borderRadius:'16px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                <h3 style={{ color:'var(--text)', fontSize:'15px', fontWeight:700, marginBottom:'18px' }}>{t.itemsOrdered}</h3>
                {order.items.map((item,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width:'48px', height:'48px', borderRadius:'8px', objectFit:'cover' }}/>}
                    <div style={{ flex:1 }}>
                      <p style={{ color:'var(--text)', fontWeight:600, fontSize:'14px' }}>{item.name}</p>
                      <p style={{ color:'var(--text3)', fontSize:'12px' }}>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <p style={{ color:'#e84040', fontWeight:700 }}>${(item.price*item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div style={{ height:'1px', background:'var(--border)', margin:'14px 0' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text2)', fontSize:'14px', marginBottom:'8px' }}><span>{t.subtotal}</span><span>${(order.totalAmount-(order.deliveryFee||5)).toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text2)', fontSize:'14px', marginBottom:'8px' }}><span>{t.deliveryFee}</span><span>${(order.deliveryFee||5).toFixed(2)}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'17px', marginTop:'8px' }}>
                  <span style={{ color:'var(--text)' }}>{t.total}</span><span style={{ color:'#e84040' }}>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ background:'var(--card)', borderRadius:'16px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                <h3 style={{ color:'var(--text)', fontSize:'15px', fontWeight:700, marginBottom:'16px' }}>{t.paymentInfo}</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'14px' }}>
                  <div style={{ background:'var(--bg2)', borderRadius:'10px', padding:'12px' }}>
                    <p style={{ color:'var(--text3)', fontSize:'11px', marginBottom:'4px' }}>Payment</p>
                    <p style={{ color:'var(--text)', fontWeight:600, fontSize:'13px', textTransform:'capitalize' }}>{order.payment?.method?.replace('_',' ')}</p>
                  </div>
                  <div style={{ background:'var(--bg2)', borderRadius:'10px', padding:'12px' }}>
                    <p style={{ color:'var(--text3)', fontSize:'11px', marginBottom:'4px' }}>Est. Delivery</p>
                    <p style={{ color:'var(--text)', fontWeight:600, fontSize:'13px' }}>{order.estimatedDelivery}</p>
                  </div>
                </div>
                {order.address?.fullAddress && (
                  <div style={{ padding:'12px', background:'var(--bg2)', borderRadius:'10px' }}>
                    <p style={{ color:'var(--text3)', fontSize:'12px', marginBottom:'4px' }}>📍 {t.deliveryAddress}</p>
                    <p style={{ color:'var(--text)', fontSize:'13px' }}>{order.address.fullAddress}</p>
                  </div>
                )}
              </div>

              <div style={{ display:'flex', gap:'12px' }}>
                <button onClick={()=>navigate('/orders')} style={{ flex:1, padding:'12px', background:'transparent', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text2)', fontSize:'14px', cursor:'pointer' }}>{t.allOrders}</button>
                <button onClick={()=>navigate('/menu')} style={{ flex:2, padding:'12px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>{t.orderMore}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
