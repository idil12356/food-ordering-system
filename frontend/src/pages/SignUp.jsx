import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function SignUp() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', { name:form.name, email:form.email, password:form.password });
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
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
          <h2 style={{ color:'var(--text)', fontSize:'22px', fontWeight:700, textAlign:'center', marginBottom:'6px' }}>{t.createAccount}</h2>
          <p style={{ color:'var(--text2)', fontSize:'13px', textAlign:'center', marginBottom:'24px' }}>{t.joinUs}</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { k:'name', l:t.fullName, type:'text', p:'Your full name' },
              { k:'email', l:t.email, type:'email', p:'your@email.com' },
              { k:'password', l:t.password, type:'password', p:'Min 6 characters' },
              { k:'confirm', l:t.confirmPassword, type:'password', p:t.repeatPassword },
            ].map(f => (
              <div key={f.k} style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{f.l}</label>
                <input type={f.type} value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.p} required style={inp}/>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ padding:'14px', background:'#e84040', border:'none', borderRadius:'12px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer', marginTop:'4px' }}>
              {loading ? 'Creating...' : t.signup}
            </button>
          </form>

          <p style={{ color:'var(--text2)', fontSize:'14px', textAlign:'center', marginTop:'20px' }}>
            {t.alreadyAccount} <Link to="/login" style={{ color:'#e84040', fontWeight:600 }}>{t.login}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
