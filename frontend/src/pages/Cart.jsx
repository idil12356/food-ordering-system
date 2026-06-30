import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, deliveryFee, total } = useCart();
  const { user, updateUser, isAdmin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState('cart');
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ street:'', city:'', zipCode:'' });
  const [payMethod, setPayMethod] = useState('mobile_money');
  const [mobileProvider, setMobileProvider] = useState('Evc Plus');
  const [mobilePhone, setMobilePhone] = useState('+252 ');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const inp = { background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', padding:'11px 14px', fontSize:'14px', width:'100%' };

  const handleCheckout = () => {
    if (!user) return navigate('/login');
    setStep('checkout');
    window.scrollTo(0,0);
  };

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city) return toast.error('Please fill delivery address');
    if (payMethod==='mobile_money' && mobilePhone.trim().length<8) return toast.error('Enter valid phone number');
    if (payMethod==='card' && (!cardNum||!cardExp||!cardCvc)) return toast.error('Fill card details');
    try {
      setPlacing(true);
      const res = await axios.post('/api/orders', {
        items: cart.map(i=>({ menuItem:i._id, name:i.name, price:i.price, quantity:i.quantity, image:i.image })),
        totalAmount:total, deliveryFee,
        address:{ street:address.street, city:address.city, zipCode:address.zipCode, fullAddress:`${address.street}, ${address.city}${address.zipCode?' '+address.zipCode:''}` },
        payment:{ method:payMethod, provider:payMethod==='mobile_money'?mobileProvider:payMethod==='card'?'Credit Card':'Cash', phone:mobilePhone, status:payMethod==='cash'?'pending':'paid' }
      });
      if (updateUser) updateUser({ hasOrdered:true });
      clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/orders/${res.data._id}`);
    } catch(err) { toast.error(err.response?.data?.message||'Failed to place order'); }
    finally { setPlacing(false); }
  };

  if (cart.length===0 && step==='cart') return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }}>
      <Navbar/>
      <div style={{ minHeight:'70vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div style={{ fontSize:'70px', marginBottom:'20px' }}>🛒</div>
        <h2 style={{ color:'var(--text)', marginBottom:'10px' }}>{t.cartEmpty}</h2>
        <p style={{ color:'var(--text2)', marginBottom:'30px' }}>{t.addItems}</p>
        <button onClick={()=>navigate('/menu')} style={{ padding:'13px 35px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>{t.browseMenu}</button>
      </div>
      <Footer/>
    </div>
  );

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh' }} className="page-enter">
      <Navbar/>
      <div style={{ padding:'50px 40px' }} className="page-pad">
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>

          {/* CART STEP */}
          {step==='cart' && (
            <>
              <h2 style={{ fontSize:'32px', fontWeight:700, marginBottom:'30px', color:'var(--text)' }}>{t.yourCart}</h2>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'28px', alignItems:'start' }} className="layout-2col">
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {cart.map(item=>(
                    <div key={item._id} style={{ background:'var(--card)', borderRadius:'14px', padding:'16px', display:'flex', alignItems:'center', gap:'14px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', transition:'all 0.3s' }}>
                      <img src={item.image} alt={item.name} style={{ width:'65px', height:'65px', borderRadius:'10px', objectFit:'cover' }}/>
                      <div style={{ flex:1 }}>
                        <h4 style={{ color:'var(--text)', fontSize:'15px', fontWeight:600, marginBottom:'4px' }}>{item.name}</h4>
                        <p style={{ color:'#e84040', fontSize:'14px', fontWeight:600 }}>${item.price.toFixed(2)}</p>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <button onClick={()=>updateQuantity(item._id,item.quantity-1)} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                        <span style={{ color:'var(--text)', fontWeight:700, minWidth:'20px', textAlign:'center' }}>{item.quantity}</span>
                        <button onClick={()=>updateQuantity(item._id,item.quantity+1)} style={{ width:'30px', height:'30px', borderRadius:'8px', background:'var(--bg2)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                      </div>
                      <span style={{ color:'#e84040', fontWeight:700, fontSize:'15px', minWidth:'55px', textAlign:'right' }}>${(item.price*item.quantity).toFixed(2)}</span>
                      <button onClick={()=>removeFromCart(item._id)} style={{ background:'transparent', border:'none', fontSize:'16px', cursor:'pointer', opacity:0.6, color:'var(--text)' }}>🗑</button>
                    </div>
                  ))}
                </div>

                <div style={{ background:'var(--card)', borderRadius:'16px', padding:'24px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', position:'sticky', top:'90px', transition:'all 0.3s' }}>
                  <h3 style={{ color:'var(--text)', fontSize:'17px', fontWeight:700, marginBottom:'20px' }}>{t.orderSummary}</h3>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text2)', fontSize:'14px', marginBottom:'12px' }}><span>{t.subtotal}</span><span>${subtotal.toFixed(2)}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', color:'var(--text2)', fontSize:'14px', marginBottom:'12px' }}><span>{t.deliveryFee}</span><span>${deliveryFee.toFixed(2)}</span></div>
                  <div style={{ height:'1px', background:'var(--border)', margin:'14px 0' }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:'20px' }}>
                    <span style={{ color:'var(--text)' }}>{t.total}</span>
                    <span style={{ color:'#e84040' }}>${total.toFixed(2)}</span>
                  </div>
                  <button onClick={handleCheckout} style={{ width:'100%', padding:'14px', background:'#e84040', border:'none', borderRadius:'12px', color:'#fff', fontSize:'15px', fontWeight:600, cursor:'pointer', marginTop:'18px' }}>{t.proceedToCheckout}</button>
                  <button onClick={clearCart} style={{ width:'100%', padding:'12px', background:'transparent', border:'1px solid var(--border)', borderRadius:'12px', color:'var(--text2)', fontSize:'13px', cursor:'pointer', marginTop:'10px' }}>{t.clearCart}</button>
                </div>
              </div>
            </>
          )}

          {/* CHECKOUT STEP */}
          {step==='checkout' && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px' }}>
                <button onClick={()=>setStep('cart')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text2)', padding:'8px 16px', fontSize:'13px', cursor:'pointer' }}>{t.backToCart}</button>
                <h2 style={{ fontSize:'28px', fontWeight:700, color:'var(--text)' }}>{t.checkout}</h2>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'24px', alignItems:'start' }} className="checkout-layout">
                {/* Left */}
                <div style={{ display:'flex', flexDirection:'column', gap:'16px', position:'sticky', top:'90px' }}>
                  <div style={{ background:'var(--card)', borderRadius:'14px', padding:'18px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                    <div style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'8px' }}>✅ {t.freeCancellation}</div>
                    <div style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'8px' }}>✅ {t.securePayment}</div>
                    <div style={{ color:'var(--text2)', fontSize:'13px' }}>✅ {t.fastDeliveryLabel}</div>
                  </div>
                  <div style={{ background:'var(--card)', borderRadius:'14px', padding:'18px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                    <h4 style={{ color:'var(--text)', fontSize:'14px', fontWeight:600, marginBottom:'12px' }}>{t.orderSummary}</h4>
                    <p style={{ color:'#e84040', fontSize:'26px', fontWeight:800, marginBottom:'14px' }}>${total.toFixed(2)}</p>
                    {cart.map(i=>(
                      <div key={i._id} style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                        <span style={{ color:'var(--text2)', fontSize:'13px' }}>{i.name} ×{i.quantity}</span>
                        <span style={{ color:'#e84040', fontSize:'13px' }}>${(i.price*i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ height:'1px', background:'var(--border)', margin:'10px 0' }}/>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ color:'var(--text3)' }}>{t.deliveryFee}</span>
                      <span style={{ color:'var(--text2)' }}>${deliveryFee.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  {/* Address */}
                  <div style={{ background:'var(--card)', borderRadius:'14px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                    <h3 style={{ color:'var(--text)', fontSize:'12px', fontWeight:700, letterSpacing:'1px', marginBottom:'18px' }}>{t.shippingDetails}</h3>
                    <div style={{ marginBottom:'14px' }}>
                      <label style={{ display:'block', color:'var(--text2)', fontSize:'12px', marginBottom:'6px' }}>{t.streetAddress}</label>
                      <input value={address.street} onChange={e=>setAddress({...address,street:e.target.value})} placeholder={t.streetAddress} style={inp}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                      <div>
                        <label style={{ display:'block', color:'var(--text2)', fontSize:'12px', marginBottom:'6px' }}>{t.city}</label>
                        <input value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} placeholder={t.city} style={inp}/>
                      </div>
                      <div>
                        <label style={{ display:'block', color:'var(--text2)', fontSize:'12px', marginBottom:'6px' }}>{t.zipCode}</label>
                        <input value={address.zipCode} onChange={e=>setAddress({...address,zipCode:e.target.value})} placeholder={t.zipCode} style={inp}/>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div style={{ background:'var(--card)', borderRadius:'14px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
                    <h3 style={{ color:'var(--text)', fontSize:'12px', fontWeight:700, letterSpacing:'1px', marginBottom:'18px' }}>{t.paymentMethod}</h3>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'16px' }}>
                      {[{id:'mobile_money',icon:'📱',label:t.mobileMoneyLabel},{id:'card',icon:'💳',label:t.cardLabel},{id:'cash',icon:'💵',label:t.cashLabel}].map(m=>(
                        <button key={m.id} onClick={()=>setPayMethod(m.id)}
                          style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'14px 8px', background:payMethod===m.id?'rgba(232,64,64,0.12)':'var(--input-bg)', border:`1px solid ${payMethod===m.id?'#e84040':'var(--border)'}`, borderRadius:'12px', color:payMethod===m.id?'var(--text)':'var(--text2)', cursor:'pointer', gap:'4px' }}>
                          <span style={{ fontSize:'22px' }}>{m.icon}</span>
                          <span style={{ fontSize:'12px' }}>{m.label}</span>
                        </button>
                      ))}
                    </div>
                    {payMethod==='mobile_money' && (
                      <div style={{ background:'var(--input-bg)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)' }}>
                        <p style={{ color:'#e84040', fontSize:'13px', fontWeight:600, marginBottom:'12px' }}>Mobile Money Details</p>
                        <label style={{ display:'block', color:'var(--text2)', fontSize:'12px', marginBottom:'6px' }}>{t.provider}</label>
                        <select value={mobileProvider} onChange={e=>setMobileProvider(e.target.value)} style={{ ...inp, marginBottom:'12px' }}>
                          {['Evc Plus','SAHAL','SAAD','M-Pesa','MTN Mobile Money','Airtel Money','Tigo Pesa'].map(p=><option key={p}>{p}</option>)}
                        </select>
                        <label style={{ display:'block', color:'var(--text2)', fontSize:'12px', marginBottom:'6px' }}>{t.phoneNumber}</label>
                        <input value={mobilePhone} onChange={e=>setMobilePhone(e.target.value)} placeholder="+252 61 234 5678" style={inp}/>
                      </div>
                    )}
                    {payMethod==='card' && (
                      <div style={{ background:'var(--input-bg)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)' }}>
                        <p style={{ color:'#e84040', fontSize:'13px', fontWeight:600, marginBottom:'12px' }}>{t.creditCardDetails}</p>
                        <input value={cardNum} onChange={e=>setCardNum(e.target.value)} placeholder={t.cardNumber} maxLength={19} style={{ ...inp, marginBottom:'12px' }}/>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                          <input value={cardExp} onChange={e=>setCardExp(e.target.value)} placeholder="MM/YY" style={inp}/>
                          <input value={cardCvc} onChange={e=>setCardCvc(e.target.value)} placeholder="CVC" maxLength={3} style={inp}/>
                        </div>
                      </div>
                    )}
                    {payMethod==='cash' && (
                      <div style={{ background:'var(--input-bg)', borderRadius:'12px', padding:'16px', border:'1px solid var(--border)', textAlign:'center' }}>
                        <p style={{ color:'var(--text2)', fontSize:'14px' }}>{t.cashNote}</p>
                      </div>
                    )}
                  </div>

                  <button onClick={handlePlaceOrder} disabled={placing}
                    style={{ width:'100%', padding:'16px', background:'#e84040', border:'none', borderRadius:'14px', color:'#fff', fontSize:'17px', fontWeight:700, cursor:'pointer' }}>
                    {placing ? '...' : `${t.payNow} $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}
