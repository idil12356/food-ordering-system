import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const STATUS = {
  pending:          { key:'pending',          icon:'🕐', color:'#f59e0b' },
  confirmed:        { key:'confirmed',         icon:'✅', color:'#3b82f6' },
  preparing:        { key:'preparing',         icon:'👨‍🍳', color:'#8b5cf6' },
  out_for_delivery: { key:'outForDelivery',    icon:'🚀', color:'#f97316' },
  delivered:        { key:'delivered',         icon:'🎉', color:'#10b981' },
  cancelled:        { key:'cancelled',         icon:'❌', color:'#ef4444' },
};
const STEPS = ['pending','confirmed','preparing','out_for_delivery','delivered'];

export default function Orders() {
  const { user, isAdmin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/my-orders');
      setOrders(res.data);
      if (res.data.length > 0) setSelected(res.data[0]);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const cancelOrder = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await axios.put(`/api/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o._id === id ? res.data : o));
      setSelected(res.data);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  const filtered = orders.filter(o => filter==='all' || o.status===filter);

  if (loading) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}><Navbar/>
      <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}>Loading...</div>
    </div>
  );

  if (isAdmin) return (
    <div style={{ background:"var(--bg)", minHeight:"100vh" }}><Navbar/>
      <div style={{ minHeight:"70vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:"60px", marginBottom:"20px" }}>🚫</div>
        <h2 style={{ color:"var(--text)", marginBottom:"10px" }}>Admin cannot view user orders</h2>
        <p style={{ color:"var(--text2)", marginBottom:"30px" }}>Manage orders from the Admin Dashboard</p>
        <button onClick={()=>navigate("/admin/orders")} style={{ padding:"13px 35px", background:"#e84040", border:"none", borderRadius:"10px", color:"#fff", fontSize:"15px", fontWeight:600, cursor:"pointer" }}>Go to Admin Orders</button>
      </div>
      <Footer/>
    </div>
  );

  if (orders.length===0) return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}><Navbar/>
      <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:'70px', marginBottom:'20px' }}>📦</div>
        <h2 style={{ color:'var(--text)', marginBottom:'10px' }}>{t.noOrders}</h2>
        <p style={{ color:'var(--text2)', marginBottom:'30px' }}>{t.startOrdering}</p>
        <button onClick={()=>navigate('/menu')} style={{ padding:'13px 35px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>{t.browseMenu}</button>
      </div>
      <Footer/>
    </div>
  );

  const info = selected ? STATUS[selected.status] : null;
  const stepIdx = selected ? STEPS.indexOf(selected.status) : -1;

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }} className="page-enter">
      <Navbar/>
      <div style={{ padding:'50px 40px' }} className="page-pad">
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'30px', fontWeight:700, marginBottom:'22px', color:'var(--text)' }}>{t.myOrdersTitle}</h2>

          {/* Filter tabs */}
          <div style={{ display:'flex', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
            {[
              { key:'all', label:'All' },
              { key:'pending', label:`🕐 ${t.pending}` },
              { key:'preparing', label:`👨‍🍳 ${t.preparing}` },
              { key:'out_for_delivery', label:`🚀 ${t.outForDelivery}` },
              { key:'delivered', label:`✅ ${t.delivered}` },
              { key:'cancelled', label:`❌ ${t.cancelled}` },
            ].map(f=>(
              <button key={f.key} onClick={()=>setFilter(f.key)}
                style={{ padding:'7px 14px', background:filter===f.key?'#e84040':'var(--card)', border:`1px solid ${filter===f.key?'#e84040':'var(--border)'}`, borderRadius:'50px', color:filter===f.key?'#fff':'var(--text2)', fontSize:'12px', fontWeight:filter===f.key?600:400, cursor:'pointer', boxShadow:'var(--card-shadow)' }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:'22px', alignItems:'start' }} className="layout-2col">
            {/* List */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'calc(100vh - 220px)', overflowY:'auto' }}>
              {filtered.map(order=>{
                const si = STATUS[order.status];
                return (
                  <div key={order._id} onClick={()=>setSelected(order)}
                    style={{ background:'var(--card)', borderRadius:'14px', padding:'16px', border:`1px solid ${selected?._id===order._id?'#e84040':'var(--card-border)'}`, cursor:'pointer', boxShadow:'var(--card-shadow)', transition:'all 0.2s' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <div>
                        <p style={{ color:'var(--text)', fontWeight:700, fontSize:'14px' }}>#{order._id.slice(-6).toUpperCase()}</p>
                        <p style={{ color:'var(--text3)', fontSize:'11px', marginTop:'2px' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span style={{ padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:si.color+'20', color:si.color }}>
                        {si.icon} {t[si.key]}
                      </span>
                    </div>
                    <p style={{ color:'var(--text2)', fontSize:'12px', marginBottom:'6px' }}>{order.items.map(i=>i.name).join(', ').substring(0,45)}...</p>
                    <p style={{ color:'#e84040', fontWeight:700, fontSize:'15px' }}>${order.totalAmount.toFixed(2)}</p>
                  </div>
                );
              })}
              {filtered.length===0 && <p style={{ color:'var(--text3)', textAlign:'center', padding:'30px' }}>No orders found</p>}
            </div>

            {/* Detail */}
            {selected && info && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ background:info.color+'12', borderRadius:'16px', padding:'22px', border:`1px solid ${info.color}30`, display:'flex', alignItems:'center', gap:'18px' }}>
                  <span style={{ fontSize:'40px' }}>{info.icon}</span>
                  <div style={{ flex:1 }}>
                    <h3 style={{ color:info.color, fontSize:'18px', fontWeight:700 }}>{t[info.key]}</h3>
                    <p style={{ color:'var(--text3)', fontSize:'13px' }}>Order #{selected._id.slice(-6).toUpperCase()}</p>
                  </div>
                  {['pending','confirmed'].includes(selected.status) && (
                    <button onClick={()=>cancelOrder(selected._id)} disabled={cancelling}
                      style={{ padding:'8px 16px', background:'transparent', border:'1px solid #ef4444', borderRadius:'8px', color:'#ef4444', fontSize:'13px', cursor:'pointer' }}>
                      {cancelling ? '...' : t.cancelOrder}
                    </button>
                  )}
                </div>

                {selected.status !== 'cancelled' && (
                  <div style={{ background:'var(--card)', borderRadius:'14px', padding:'20px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                    <h4 style={{ color:'var(--text)', fontSize:'14px', fontWeight:600, marginBottom:'16px' }}>{t.orderProgress}</h4>
                    {STEPS.map((step,idx)=>{
                      const si = STATUS[step];
                      const done = idx<=stepIdx;
                      const active = idx===stepIdx;
                      return (
                        <div key={step} style={{ display:'flex', gap:'14px', marginBottom:'4px' }}>
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:done?si.color:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px', fontWeight:700, flexShrink:0, boxShadow:active?`0 0 12px ${si.color}50`:'none' }}>
                              {done?'✓':idx+1}
                            </div>
                            {idx<STEPS.length-1 && <div style={{ width:'2px', height:'40px', marginTop:'3px', background:idx<stepIdx?si.color:'var(--bg2)' }}/>}
                          </div>
                          <div style={{ paddingBottom:'24px' }}>
                            <p style={{ color:done?'var(--text)':'var(--text3)', fontWeight:done?600:400, fontSize:'14px' }}>{si.icon} {t[si.key]}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ background:'var(--card)', borderRadius:'14px', padding:'18px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                  <h4 style={{ color:'var(--text)', fontSize:'14px', fontWeight:600, marginBottom:'14px' }}>{t.itemsOrdered}</h4>
                  {selected.items.map((item,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width:'46px', height:'46px', borderRadius:'8px', objectFit:'cover' }}/>}
                      <div style={{ flex:1 }}>
                        <p style={{ color:'var(--text)', fontWeight:600, fontSize:'14px' }}>{item.name}</p>
                        <p style={{ color:'var(--text3)', fontSize:'12px' }}>×{item.quantity}</p>
                      </div>
                      <p style={{ color:'#e84040', fontWeight:700 }}>${(item.price*item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div style={{ height:'1px', background:'var(--border)', margin:'12px 0' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text2)', fontSize:'14px', marginBottom:'8px' }}><span>{t.subtotal}</span><span>${(selected.totalAmount-(selected.deliveryFee||5)).toFixed(2)}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text2)', fontSize:'14px', marginBottom:'8px' }}><span>{t.deliveryFee}</span><span>${(selected.deliveryFee||5).toFixed(2)}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'17px', marginTop:'8px' }}>
                    <span style={{ color:'var(--text)' }}>{t.total}</span><span style={{ color:'#e84040' }}>${selected.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {selected.address?.fullAddress && (
                  <div style={{ background:'var(--card)', borderRadius:'14px', padding:'16px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                    <p style={{ color:'var(--text3)', fontSize:'12px', marginBottom:'4px' }}>📍 {t.deliveryAddress}</p>
                    <p style={{ color:'var(--text)', fontSize:'13px' }}>{selected.address.fullAddress}</p>
                  </div>
                )}

                <button onClick={()=>navigate('/menu')}
                  style={{ width:'100%', padding:'13px', background:'#e84040', border:'none', borderRadius:'12px', color:'#fff', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                  {t.orderMore}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
