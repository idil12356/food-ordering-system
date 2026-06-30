import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const DEMO = [
  { _id:'1', name:'Classic Burger', category:'Burgers', price:12.99, image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { _id:'2', name:'Margherita Pizza', category:'Pizza', price:14.99, image:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { _id:'3', name:'Dragon Roll', category:'Sushi', price:18.99, image:'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400' },
  { _id:'4', name:'Berry Smoothie', category:'Drinks', price:6.99, image:'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
];

export default function Home() {
  const { t } = useLang();
  const { addToCart } = useCart();
  const [popular, setPopular] = useState(DEMO);

  useEffect(() => {
    axios.get('/api/menu').then(res => { if (res.data?.length > 0) setPopular(res.data.slice(0,4)); }).catch(()=>{});
  }, []);

  return (
    <div className="page-enter">
      <Navbar/>
      <div style={{ position:'relative', height:'88vh', backgroundImage:'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400)', backgroundSize:'cover', backgroundPosition:'center', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,.55),rgba(10,13,20,.95))' }}/>
        <div style={{ position:'relative', textAlign:'center', padding:'0 20px' }}>
          <div style={{ display:'inline-block', background:'rgba(232,64,64,0.15)', border:'1px solid rgba(232,64,64,0.3)', borderRadius:'50px', padding:'8px 20px', fontSize:'13px', color:'#e84040', marginBottom:'24px', fontWeight:500 }}>
            🍽️ Galkio Online Food Ordering
          </div>
          <h1 style={{ fontSize:'62px', fontWeight:800, lineHeight:1.1, marginBottom:'20px', color:'#fff' }} className="hero-title">
            {t.heroTitle}<br/><span style={{ color:'#e84040' }}>{t.heroAccent}</span>
          </h1>
          <p style={{ fontSize:'16px', color:'#94a3b8', maxWidth:'480px', margin:'0 auto 35px', lineHeight:1.7 }}>{t.heroSub}</p>
          <Link to="/menu" style={{ display:'inline-block', padding:'15px 40px', background:'#e84040', borderRadius:'50px', color:'#fff', fontSize:'15px', fontWeight:600 }}>{t.orderNow}</Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:'80px 40px', background:'var(--bg)' }}>
        <div style={{ maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'24px' }} className="grid-3">
          {[
            { icon:'🕐', t:t.fastDelivery, d:t.fastDeliveryDesc, color:'#e84040' },
            { icon:'🏆', t:t.masterChefs, d:t.masterChefsDesc, color:'#f59e0b' },
            { icon:'🛡️', t:t.freshIngredients, d:t.freshIngredientsDesc, color:'#10b981' },
          ].map((f,i) => (
            <div key={i} style={{ background:'var(--card)', borderRadius:'18px', padding:'36px 28px', textAlign:'center', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', transition:'all 0.3s' }} className="card-hover">
              <div style={{ width:'64px', height:'64px', borderRadius:'16px', background:f.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', margin:'0 auto 18px' }}>{f.icon}</div>
              <h3 style={{ fontSize:'17px', fontWeight:700, marginBottom:'10px', color:'var(--text)' }}>{f.t}</h3>
              <p style={{ fontSize:'13px', color:'var(--text2)', lineHeight:1.7 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Dishes */}
      <div style={{ padding:'60px 40px', background:'var(--bg2)' }}>
        <div style={{ maxWidth:'1300px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'32px', fontWeight:700, textAlign:'center', marginBottom:'10px', color:'var(--text)' }}>
            {t.popularDishes} <span style={{ color:'#e84040' }}>🔥</span>
          </h2>
          <p style={{ color:'var(--text2)', textAlign:'center', fontSize:'15px', marginBottom:'40px' }}>{t.popularSub}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'20px' }} className="grid-4">
            {popular.map(item => (
              <div key={item._id} style={{ background:'var(--card)', borderRadius:'16px', overflow:'hidden', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', transition:'all 0.3s' }} className="card-hover">
                <div style={{ position:'relative', height:'180px', overflow:'hidden' }}>
                  <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <span style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,.8)', color:'#fff', padding:'3px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:600 }}>
                    {item.category?.toUpperCase()}
                  </span>
                </div>
                <div style={{ padding:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                    <h4 style={{ color:'var(--text)', fontSize:'14px', fontWeight:700 }}>{item.name}</h4>
                    <span style={{ color:'#e84040', fontWeight:700, fontSize:'14px' }}>${item.price?.toFixed(2)}</span>
                  </div>
                  <button onClick={() => { addToCart(item); toast.success(`${item.name} added! 🛒`); }}
                    style={{ width:'100%', padding:'10px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                    {t.addToCart}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding:'80px 40px', textAlign:'center', background:'var(--bg)' }}>
        <h2 style={{ fontSize:'34px', fontWeight:700, marginBottom:'12px', color:'var(--text)' }}>{t.readyToOrder}</h2>
        <p style={{ color:'var(--text2)', marginBottom:'28px', fontSize:'15px' }}>{t.exploreDishes}</p>
        <Link to="/menu" style={{ display:'inline-block', padding:'14px 36px', background:'#e84040', borderRadius:'50px', color:'#fff', fontSize:'15px', fontWeight:600 }}>{t.viewFullMenu}</Link>
      </div>

      <Footer/>
    </div>
  );
}
