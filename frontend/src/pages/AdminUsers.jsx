import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'22px', flexWrap:'wrap', gap:'14px' }}>
        <div>
          <h2 style={{ fontSize:'24px', fontWeight:700, color:'var(--text)', marginBottom:'4px' }}>
            User <span style={{ color:'#e84040' }}>Management</span>
          </h2>
          <p style={{ color:'var(--text2)', fontSize:'13px' }}>Manage registered users and administrators.</p>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchUsers}
          style={{ background:'var(--input-bg)', border:'1px solid var(--card-border)', borderRadius:'10px', color:'var(--text)', padding:'10px 16px', fontSize:'13px', width:'220px', boxShadow:'var(--card-shadow)' }}/>
      </div>

      <div style={{ background:'var(--card)', borderRadius:'14px', border:'1px solid var(--card-border)', overflow:'hidden', boxShadow:'var(--card-shadow)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--bg2)' }}>
              {['User','Email','Role','Status','Joined','Actions'].map(h => (
                <th key={h} style={{ padding:'14px 18px', color:'var(--text3)', fontSize:'11px', fontWeight:600, textAlign:'left', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>Loading...</td></tr>
            ) : filtered.length===0 ? (
              <tr><td colSpan={6} style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u._id} style={{ borderBottom:'1px solid var(--card-border)' }}>
                <td style={{ padding:'14px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:u.role==='admin'?'#e84040':'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ color:'var(--text)', fontWeight:600, fontSize:'14px' }}>{u.name}</p>
                      {u.role==='admin' && <p style={{ color:'var(--text3)', fontSize:'11px' }}>Super Admin</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding:'14px 18px' }}><span style={{ color:'var(--text2)', fontSize:'13px' }}>{u.email}</span></td>
                <td style={{ padding:'14px 18px' }}>
                  <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background:u.role==='admin'?'rgba(139,92,246,0.15)':'rgba(59,130,246,0.15)', color:u.role==='admin'?'#8b5cf6':'#3b82f6' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding:'14px 18px' }}><span style={{ color:'#10b981', fontSize:'12px', fontWeight:600 }}>● Active</span></td>
                <td style={{ padding:'14px 18px' }}><span style={{ color:'var(--text3)', fontSize:'13px' }}>{new Date(u.createdAt).toLocaleDateString()}</span></td>
                <td style={{ padding:'14px 18px' }}>
                  {u.role !== 'admin' && (
                    <button onClick={()=>deleteUser(u._id)}
                      style={{ padding:'6px 14px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', color:'#ef4444', fontSize:'12px', cursor:'pointer' }}>
                      {t.delete}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
