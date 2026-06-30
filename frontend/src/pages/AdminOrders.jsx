import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:'#f59e0b', confirmed:'#3b82f6', preparing:'#8b5cf6',
  out_for_delivery:'#f97316', delivered:'#10b981', cancelled:'#ef4444'
};

export default function AdminOrders() {
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const prevOrderIds = useRef(new Set());

  useEffect(() => {
    fetchOrders();
    // Poll every 30 seconds for new orders
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`/api/admin/orders?status=${filter}`);
      const fetchedOrders = res.data;

      // Detect new orders
      if (prevOrderIds.current.size > 0) {
        const newOnes = fetchedOrders.filter(o => !prevOrderIds.current.has(o._id));
        if (newOnes.length > 0) {
          setNewCount(prev => prev + newOnes.length);
          toast.success(`🔔 ${newOnes.length} new order${newOnes.length > 1 ? 's' : ''}!`);
        }
      }
      fetchedOrders.forEach(o => prevOrderIds.current.add(o._id));
      setOrders(fetchedOrders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const clearNew = () => setNewCount(0);

  const updateStatus = async (id, status, cancelledBy) => {
    if (cancelledBy === 'user') { toast.error('Cannot change user-cancelled orders'); return; }
    try {
      await axios.put(`/api/admin/orders/${id}`, { status });
      setOrders(prev => prev.map(o => o._id===id ? { ...o, status } : o));
      toast.success('Status updated ✅');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  };

  const tabs = [
    { key:'all', label:'All' },
    { key:'pending', label:`⏳ ${t.pending}` },
    { key:'confirmed', label:`✅ ${t.confirmed}` },
    { key:'preparing', label:`👨‍🍳 ${t.preparing}` },
    { key:'out_for_delivery', label:`🚀 ${t.outForDelivery}` },
    { key:'delivered', label:`🎉 ${t.delivered}` },
    { key:'cancelled', label:`❌ ${t.cancelled}` },
  ];

  const displayed = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      {/* Header with NEW badge */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div>
            <h2 style={{ fontSize:'24px', fontWeight:700, color:'var(--text)', marginBottom:'4px' }}>
              Order <span style={{ color:'#e84040' }}>Management</span>
            </h2>
            <p style={{ color:'var(--text2)', fontSize:'13px' }}>Track and manage customer orders.</p>
          </div>
          {newCount > 0 && (
            <div onClick={clearNew} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'rgba(232,64,64,0.12)', border:'1px solid rgba(232,64,64,0.4)', borderRadius:'50px', cursor:'pointer', animation:'pulse 2s infinite' }}>
              <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#e84040', display:'inline-block' }}/>
              <span style={{ color:'#e84040', fontSize:'13px', fontWeight:700 }}>{newCount} NEW</span>
              <span style={{ color:'#e84040', fontSize:'11px' }}>✕</span>
            </div>
          )}
        </div>
        <button onClick={fetchOrders} style={{ padding:'8px 16px', background:'var(--card)', border:'1px solid var(--card-border)', borderRadius:'8px', color:'var(--text2)', fontSize:'13px', cursor:'pointer', boxShadow:'var(--card-shadow)' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'18px', flexWrap:'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{ padding:'7px 14px', background:filter===tab.key?'#e84040':'var(--card)', border:`1px solid ${filter===tab.key?'#e84040':'var(--card-border)'}`, borderRadius:'8px', color:filter===tab.key?'#fff':'var(--text2)', fontSize:'12px', fontWeight:filter===tab.key?600:400, cursor:'pointer', boxShadow:'var(--card-shadow)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'var(--card)', borderRadius:'14px', border:'1px solid var(--card-border)', overflow:'auto', boxShadow:'var(--card-shadow)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              {['Order','Customer','Items','Total','Status','Action'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', color:'var(--text3)', fontSize:'11px', fontWeight:600, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>Loading...</td></tr>
            ) : displayed.length===0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>No orders found</td></tr>
            ) : displayed.map(o => {
              const userCancelled = o.status==='cancelled' && o.cancelledBy==='user';
              const isNew = !prevOrderIds.current.has(o._id);
              return (
                <tr key={o._id} style={{ borderBottom:'1px solid var(--card-border)', background:isNew?'rgba(232,64,64,0.03)':'transparent' }}>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <p style={{ color:'var(--text)', fontWeight:700, fontSize:'13px' }}>#{o._id.slice(-6).toUpperCase()}</p>
                      {isNew && <span style={{ background:'#e84040', color:'#fff', fontSize:'9px', fontWeight:700, padding:'2px 6px', borderRadius:'20px' }}>NEW</span>}
                    </div>
                    <p style={{ color:'var(--text3)', fontSize:'11px' }}>{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#e84040', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(o.user?.name||'U')[0]}
                      </div>
                      <div>
                        <p style={{ color:'var(--text)', fontWeight:500, fontSize:'13px' }}>{o.user?.name||'Unknown'}</p>
                        <p style={{ color:'var(--text3)', fontSize:'11px' }}>{o.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <p style={{ color:'var(--text2)', fontSize:'12px', maxWidth:'160px' }}>
                      {o.items.map(i=>`${i.name} ×${i.quantity}`).join(', ').substring(0,50)}
                    </p>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={{ color:'#e84040', fontWeight:700, fontSize:'14px' }}>${o.totalAmount.toFixed(2)}</span>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:600, background:(STATUS_COLORS[o.status]||'#64748b')+'20', color:STATUS_COLORS[o.status]||'#64748b', textTransform:'capitalize' }}>
                      {o.status}
                    </span>
                    {userCancelled && <p style={{ color:'#ef4444', fontSize:'10px', marginTop:'3px' }}>by user</p>}
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    {userCancelled ? (
                      <span style={{ color:'var(--text3)', fontSize:'12px', fontStyle:'italic' }}>🔒 Locked</span>
                    ) : (
                      <select value={o.status} onChange={e=>updateStatus(o._id,e.target.value,o.cancelledBy)}
                        style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', padding:'6px 10px', fontSize:'12px', cursor:'pointer' }}>
                        {['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'].map(s=>(
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
