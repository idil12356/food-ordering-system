import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const CATS = ['All','Burgers','Pizza','Sushi','Salads','Desserts','Drinks'];
const DEMO = [
  { _id:'1', name:'Classic Burger', category:'Burgers', price:12.99, description:'Juicy 100% Angus beef patty topped with fresh lettuce and ripe tomatoes.', image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { _id:'2', name:'Truffle Mushroom Burger', category:'Burgers', price:15.99, description:'Gourmet beef patty smothered in rich truffle mayonnaise.', image:'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
  { _id:'3', name:'BBQ Bacon Burger', category:'Burgers', price:13.99, description:'Smoky BBQ sauce with crispy bacon and cheddar cheese.', image:'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400' },
  { _id:'4', name:'Margherita Pizza', category:'Pizza', price:14.99, description:'Authentic Italian style with San Marzano tomato sauce.', image:'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400' },
  { _id:'5', name:'Pepperoni Feast', category:'Pizza', price:16.99, description:'Loaded with double crispy pepperoni slices and extra cheese.', image:'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400' },
  { _id:'6', name:'Dragon Roll', category:'Sushi', price:18.99, description:'Premium sushi roll with grilled eel and avocado.', image:'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400' },
  { _id:'7', name:'Caesar Salad', category:'Salads', price:10.99, description:'Crisp romaine lettuce with creamy Caesar dressing.', image:'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
  { _id:'8', name:'Chocolate Lava Cake', category:'Desserts', price:8.99, description:'Warm chocolate cake with molten truffle center.', image:'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
  { _id:'9', name:'Berry Smoothie', category:'Drinks', price:6.99, description:'Refreshing blend of strawberries and blueberries.', image:'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { t } = useLang();

  useEffect(() => { fetchMenu(); }, [cat]);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/menu?category=${cat}`);
      setItems(res.data);
    } catch { setItems(DEMO.filter(i => cat==='All'||i.category===cat)); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-enter">
      <Navbar/>
      <div style={{ background:'var(--bg)', minHeight:'100vh', padding:'60px 40px' }} className="page-pad">
        <div style={{ maxWidth:'1300px', margin:'0 auto' }}>
          <h2 style={{ fontSize:'38px', fontWeight:700, textAlign:'center', marginBottom:'10px', color:'var(--text)' }}>
            {t.ourMenu} <span style={{ color:'#e84040' }}>{t.menuWord}</span>
          </h2>
          <p style={{ color:'var(--text2)', textAlign:'center', marginBottom:'32px', fontSize:'15px' }}>{t.exploreMenu}</p>

          <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap', marginBottom:'40px' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding:'9px 20px', borderRadius:'50px', border:`1px solid ${c===cat?'#e84040':'var(--border)'}`, background:c===cat?'#e84040':'var(--card)', color:c===cat?'#fff':'var(--text2)', fontSize:'13px', fontWeight:c===cat?600:400, cursor:'pointer', transition:'all 0.2s', boxShadow:'var(--card-shadow)' }}>
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:'80px' }}>
              <div style={{ width:'40px', height:'40px', border:'3px solid var(--border)', borderTop:'3px solid #e84040', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }}/>
              <p style={{ color:'var(--text2)', marginTop:'16px' }}>{t.loading}</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'22px' }} className="grid-4">
              {items.map(item => (
                <div key={item._id} style={{ background:'var(--card)', borderRadius:'16px', overflow:'hidden', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', transition:'all 0.3s' }} className="card-hover">
                  <div style={{ position:'relative', height:'195px', overflow:'hidden' }}>
                    <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    <span style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(0,0,0,.8)', color:'#fff', padding:'3px 9px', borderRadius:'20px', fontSize:'10px', fontWeight:600 }}>
                      {item.category?.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ padding:'16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                      <h3 style={{ fontSize:'15px', fontWeight:700, flex:1, paddingRight:'8px', color:'var(--text)' }}>{item.name}</h3>
                      <span style={{ color:'#e84040', fontWeight:700, fontSize:'15px', whiteSpace:'nowrap' }}>${item.price?.toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize:'12px', lineHeight:1.5, marginBottom:'14px', color:'var(--text2)' }}>{item.description?.substring(0,70)}...</p>
                    <button onClick={() => { addToCart(item); toast.success(`${item.name} added! 🛒`); }}
                      style={{ width:'100%', padding:'11px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                      {t.addToCart}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
