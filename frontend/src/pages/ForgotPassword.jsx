import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { t } = useLang();
  const navigate = useNavigate();

  const inp = { background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', padding:'12px 14px', fontSize:'14px', width:'100%' };

  const sendCode = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/forgot-password', { email });
      setResetToken(res.data.resetToken);
      setEmailSent(res.data.emailSent);
      setStep('code');
      if (res.data.emailSent) toast.success('Reset code sent to your email!');
      else toast.success('Reset code generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Email not found'); }
    finally { setLoading(false); }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) return toast.error('Passwords do not match');
    if (newPass.length < 6) return toast.error('Min 6 characters');
    try {
      setLoading(true);
      await axios.post('/api/auth/reset-password', { token: code.trim().toUpperCase(), newPassword: newPass });
      toast.success('Password reset successfully! 🎉');
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid or expired code'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar/>
      <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div style={{ background:'var(--card)', borderRadius:'20px', padding:'36px', width:'100%', maxWidth:'420px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', textAlign:'center', transition:'all 0.3s' }}>
          <Link to="/" style={{ display:'block', fontSize:'22px', fontWeight:800, marginBottom:'20px' }}>
            <span style={{ color:'#e84040' }}>Galkio</span><span style={{ color:'var(--text)' }}>Food</span>
          </Link>

          {step === 'email' && (
            <>
              <div style={{ fontSize:'44px', marginBottom:'14px' }}>🔐</div>
              <h2 style={{ color:'var(--text)', fontSize:'22px', fontWeight:700, marginBottom:'8px' }}>{t.forgotPasswordTitle}</h2>
              <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'22px', lineHeight:1.6 }}>{t.forgotPasswordSub}</p>
              <form onSubmit={sendCode} style={{ display:'flex', flexDirection:'column', gap:'14px', textAlign:'left' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{t.email}</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required style={inp}/>
                </div>
                <button type="submit" disabled={loading} style={{ padding:'13px', background:'#e84040', border:'none', borderRadius:'12px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
                  {loading ? 'Sending...' : t.sendResetCode}
                </button>
              </form>
            </>
          )}

          {step === 'code' && (
            <>
              <div style={{ fontSize:'44px', marginBottom:'14px' }}>🔑</div>
              <h2 style={{ color:'var(--text)', fontSize:'22px', fontWeight:700, marginBottom:'8px' }}>{t.resetPassword}</h2>

              {/* Always show code on screen */}
              <div style={{ background: emailSent ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border:`1px solid ${emailSent ? '#10b981' : '#f59e0b'}40`, borderRadius:'12px', padding:'16px', marginBottom:'20px' }}>
                {emailSent ? (
                  <p style={{ color:'#10b981', fontSize:'12px', marginBottom:'8px' }}>✅ Code also sent to {email}</p>
                ) : (
                  <p style={{ color:'#f59e0b', fontSize:'12px', marginBottom:'8px' }}>⚠️ Email not configured — use this code:</p>
                )}
                <div style={{ color: emailSent ? '#10b981' : '#f59e0b', fontSize:'28px', fontWeight:800, letterSpacing:'6px', padding:'10px', background:'var(--input-bg)', borderRadius:'10px', marginBottom:'8px', fontFamily:'monospace' }}>
                  {resetToken}
                </div>
                <button onClick={() => { setCode(resetToken); toast.success('Code copied!'); }}
                  style={{ background:'transparent', border:`1px solid ${emailSent?'#10b981':'#f59e0b'}`, borderRadius:'8px', color:emailSent?'#10b981':'#f59e0b', padding:'5px 14px', fontSize:'12px', cursor:'pointer' }}>
                  Use This Code
                </button>
              </div>

              <form onSubmit={resetPass} style={{ display:'flex', flexDirection:'column', gap:'14px', textAlign:'left' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{t.resetCodeLabel}</label>
                  <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Enter reset code" required
                    style={{ ...inp, textAlign:'center', letterSpacing:'3px', fontSize:'18px', fontWeight:700 }}/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{t.newPassword}</label>
                  <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Min 6 characters" required style={inp}/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={{ color:'var(--text2)', fontSize:'13px', fontWeight:500 }}>{t.confirmPassword}</label>
                  <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repeat password" required style={inp}/>
                </div>
                <button type="submit" disabled={loading} style={{ padding:'13px', background:'#e84040', border:'none', borderRadius:'12px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
                  {loading ? 'Resetting...' : t.resetPassword}
                </button>
              </form>
            </>
          )}

          <p style={{ textAlign:'center', marginTop:'18px' }}>
            <Link to="/login" style={{ color:'var(--text2)', fontSize:'13px' }}>{t.backToLogin}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
