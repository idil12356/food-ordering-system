import { useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';

export default function Footer() {
  const location = useLocation();
  const { t } = useLang();
  if (location.pathname.startsWith('/admin')) return null;
  return (
    <footer style={{ background:'var(--footer-bg)', padding:'60px 0 20px', marginTop:'80px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'0 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1.5fr', gap:'40px' }}>
          <div>
            <div style={{ fontSize:'20px', fontWeight:800, marginBottom:'16px' }}>
              <span style={{ color:'#e84040' }}>Galkio</span><span style={{ color:'#fff' }}>Food</span>
            </div>
            <p style={{ color:'#94a3b8', fontSize:'13px', lineHeight:1.7, marginBottom:'20px' }}>{t.premiumDesc}</p>
            <div style={{ display:'flex', gap:'10px' }}>
              {['f','𝕏','📷','▶'].map((i,k) => <div key={k} style={{ width:'34px', height:'34px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:'12px', cursor:'pointer', border:'1px solid rgba(255,255,255,0.08)' }}>{i}</div>)}
            </div>
          </div>
          <div>
            <h4 style={{ color:'#fff', fontSize:'14px', fontWeight:600, marginBottom:'18px' }}>{t.quickLinks}</h4>
            {[t.home, t.menu, t.aboutUs, t.contact].map(l => <div key={l} style={{ color:'#64748b', fontSize:'13px', marginBottom:'10px', cursor:'pointer' }}>{l}</div>)}
          </div>
          <div>
            <h4 style={{ color:'#fff', fontSize:'14px', fontWeight:600, marginBottom:'18px' }}>{t.support}</h4>
            {[t.faq, t.privacyPolicy, t.termsOfService, t.helpCenter].map(l => <div key={l} style={{ color:'#64748b', fontSize:'13px', marginBottom:'10px', cursor:'pointer' }}>{l}</div>)}
          </div>
          <div>
            <h4 style={{ color:'#fff', fontSize:'14px', fontWeight:600, marginBottom:'18px' }}>{t.contactUs}</h4>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'10px' }}>📍 Galkio, Mudug, Somalia</div>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'10px' }}>✉️ support@galkiofood.so</div>
            <div style={{ color:'#64748b', fontSize:'13px', marginBottom:'10px' }}>📞 +252 90 7384514</div>
          </div>
        </div>
        <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'40px 0 20px' }}/>
        <p style={{ color:'#475569', fontSize:'12px', textAlign:'center' }}>© 2026 Galkio Online Food Ordering. All rights reserved.</p>
      </div>
    </footer>
  );
}
