import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, clearCart } = useCart();
  const { lang, t, toggleLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropping, setDropping] = useState(false);

  if (location.pathname.startsWith('/admin')) return null;

  const isActive = (path) => location.pathname === path;
  const handleLogout = () => { logout(); clearCart(); setDropping(false); navigate('/'); };

  return (
    <nav style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 40px', height:'68px', position:'sticky', top:0, zIndex:1000,
      background:'var(--navbar)', borderBottom:'1px solid var(--border)',
      boxShadow:'var(--card-shadow)', transition:'all 0.3s'
    }}>
      <Link to="/" style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'2px' }}>
        <span style={{ color:'#e84040' }}>Galkio</span>
        <span style={{ color:'var(--text)' }}>Food</span>
      </Link>

      <div style={{ display:'flex', gap:'4px' }} className="nav-links">
        {[{ path:'/', label:t.home },{ path:'/menu', label:t.menu }].map(l => (
          <Link key={l.path} to={l.path} style={{
            fontSize:'14px', fontWeight:500, padding:'6px 14px', borderRadius:'8px',
            position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
            color: isActive(l.path) ? '#e84040' : 'var(--text2)',
            background: isActive(l.path) ? 'rgba(232,64,64,0.08)' : 'transparent'
          }}>
            {l.label}
            {isActive(l.path) && <span style={{ position:'absolute', bottom:'-2px', left:'50%', transform:'translateX(-50%)', width:'20px', height:'2px', background:'#e84040', borderRadius:'2px' }}/>}
          </Link>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <button onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}
          style={{ width:'38px', height:'38px', borderRadius:'10px', border:'1px solid var(--border)', background:'var(--card)', color:'var(--text)', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--card-shadow)' }}>
          {isDark ? '☀️' : '🌙'}
        </button>

        <button onClick={toggleLang} title="Change Language"
          style={{ padding:'6px 11px', borderRadius:'10px', border:'1px solid var(--border)', background:'var(--card)', color:'var(--text)', fontSize:'12px', fontWeight:600, display:'flex', alignItems:'center', gap:'5px', boxShadow:'var(--card-shadow)' }}>
          🌐 {lang.toUpperCase()}
        </button>

        <Link to="/cart" style={{ position:'relative', width:'38px', height:'38px', borderRadius:'10px', border:'1px solid var(--border)', background:'var(--card)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', boxShadow:'var(--card-shadow)' }}>
          🛒
          {itemCount > 0 && <span style={{ position:'absolute', top:'-6px', right:'-6px', background:'#e84040', color:'#fff', borderRadius:'50%', width:'17px', height:'17px', fontSize:'10px', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{itemCount}</span>}
        </Link>

        {user ? (
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 10px', borderRadius:'10px', border:'1px solid var(--border)', background:'var(--card)', cursor:'pointer', boxShadow:'var(--card-shadow)' }}
              onClick={() => setDropping(!dropping)}>
              <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'#e84040', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color:'#fff' }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ color:'var(--text)', fontSize:'13px', fontWeight:500 }} className="hide-mobile">Hi, {user.name.split(' ')[0]}</span>
              <span style={{ color:'var(--text3)', fontSize:'11px' }}>▼</span>
            </div>
            {dropping && (
              <>
                <div style={{ position:'fixed', inset:0, zIndex:998 }} onClick={() => setDropping(false)}/>
                <div style={{ position:'absolute', top:'50px', right:0, background:'var(--card)', border:'1px solid var(--border)', borderRadius:'12px', padding:'8px', minWidth:'160px', zIndex:999, boxShadow:'var(--card-shadow)' }}>
                  {!isAdmin && user.hasOrdered && (
                    <Link to="/orders" style={{ display:'block', padding:'10px 14px', color:'var(--text2)', fontSize:'14px', borderRadius:'8px', cursor:'pointer' }}
                      onClick={() => setDropping(false)}>📦 {t.myOrders}</Link>
                  )}
                  <div style={{ display:'block', padding:'10px 14px', color:'#ef4444', fontSize:'14px', borderRadius:'8px', cursor:'pointer' }}
                    onClick={handleLogout}>🚪 {t.logout}</div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text)', background:'var(--card)', fontSize:'13px', fontWeight:500, boxShadow:'var(--card-shadow)' }}>{t.login}</Link>
            <Link to="/signup" style={{ padding:'7px 16px', background:'#e84040', border:'none', borderRadius:'8px', color:'#fff', fontSize:'13px', fontWeight:600 }}>{t.signup}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
