import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const inp = { background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', padding:'12px 14px', fontSize:'14px', width:'100%' };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar/>
      <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div style={{ background:'var(--card)', borderRadius:'20px', padding:'40px', width:'100%', maxWidth:'420px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', transition:'all 0.3s' }}>
          <Link to="/" style={{ display:'block', fontSize:'22px', fontWeight:800, textAlign:'center', marginBottom:'28px' }}>
            <span style={{ color:'#e84040' }}>Galkio</span><span style={{ color:'var(--text)' }}>Food</span>
          </Link>
          <h2 style={{ color:'var(--text)', fontSize:'24px', fontWeight:700, textAlign:'center', marginBottom:'6px' }}>{t.welcomeBack}</h2>
          <p style={{ color:'var(--text2)', fontSize:'13px', textAlign:'center', marginBottom:'28px' }}>{t.loginContinue}</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
              <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{t.email}</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="your@email.com" required style={inp}/>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
              <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{t.password}</label>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Enter password" required style={inp}/>
            </div>
            <button type="submit" disabled={loading} style={{ padding:'14px', background:'#e84040', border:'none', borderRadius:'12px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer', marginTop:'6px' }}>
              {loading ? 'Signing in...' : t.login}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'20px' }}>
            <Link to="/forgot-password" style={{ color:'var(--text2)', fontSize:'13px', textDecoration:'underline' }}>{t.forgotPassword}</Link>
            <p style={{ color:'var(--text2)', fontSize:'14px', marginTop:'12px' }}>
              {t.noAccount} <Link to="/signup" style={{ color:'#e84040', fontWeight:600 }}>{t.signIn}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
