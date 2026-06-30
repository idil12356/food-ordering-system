import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLang } from '../context/LangContext';
import toast from 'react-hot-toast';

const CATS = ['Burgers','Pizza','Sushi','Salads','Desserts','Drinks'];
const EMPTY = { name:'', category:'Burgers', price:'', description:'', image:null, imagePreview:'' };

export default function AdminMenu() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get('/api/menu/all');
      setItems(res.data);
    } catch {
      const res = await axios.get('/api/menu');
      setItems(res.data);
    }
  };

  const openAdd = () => { setForm(EMPTY); setEditItem(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name:item.name, category:item.category, price:item.price, description:item.description, image:null, imagePreview:item.image });
    setShowModal(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5*1024*1024) return toast.error('Image must be under 5MB');
    setForm(f => ({ ...f, image:file, imagePreview:URL.createObjectURL(file) }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return toast.error('Please drop an image file');
    setForm(f => ({ ...f, image:file, imagePreview:URL.createObjectURL(file) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.description) return toast.error('Fill all fields');
    if (!editItem && !form.image && !form.imagePreview) return toast.error('Please add an image');
    try {
      setLoading(true);
      const data = new FormData();
      data.append('name', form.name);
      data.append('category', form.category);
      data.append('price', form.price);
      data.append('description', form.description);
      if (form.image) data.append('image', form.image);
      else if (form.imagePreview) data.append('imageUrl', form.imagePreview);

      if (editItem) {
        const res = await axios.put(`/api/menu/${editItem._id}`, data, { headers:{'Content-Type':'multipart/form-data'} });
        setItems(prev => prev.map(i => i._id===editItem._id ? res.data : i));
        toast.success('Item updated ✅');
      } else {
        const res = await axios.post('/api/menu', data, { headers:{'Content-Type':'multipart/form-data'} });
        setItems(prev => [...prev, res.data]);
        toast.success('Item added! ✅');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/menu/${id}`);
      setItems(prev => prev.filter(i => i._id!==id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const inp = { background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', padding:'11px 14px', fontSize:'13px', width:'100%' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'14px' }}>
        <div>
          <h2 style={{ fontSize:'24px', fontWeight:700, color:'var(--text)', marginBottom:'4px' }}>
            Menu <span style={{ color:'#e84040' }}>Management</span>
          </h2>
          <p style={{ color:'var(--text2)', fontSize:'13px' }}>Curate your restaurant's offerings.</p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.searchItems}
            style={{ ...inp, width:'220px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}/>
          <button onClick={openAdd} style={{ padding:'10px 22px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>{t.addItem}</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18px' }} className="grid-4">
        {filtered.map(item => (
          <div key={item._id} style={{ background:'var(--card)', borderRadius:'14px', overflow:'hidden', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', transition:'all 0.3s' }} className="card-hover">
            <div style={{ position:'relative', height:'180px', overflow:'hidden' }}>
              <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e=>{e.target.src='https://via.placeholder.com/300x200?text=No+Image';}}/>
              <span style={{ position:'absolute', top:'8px', left:'8px', background:'rgba(0,0,0,.8)', color:'#fff', padding:'3px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:600 }}>
                {item.category?.toUpperCase()}
              </span>
            </div>
            <div style={{ padding:'14px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
                <h4 style={{ color:'var(--text)', fontSize:'14px', fontWeight:600, flex:1, paddingRight:'8px' }}>{item.name}</h4>
                <span style={{ color:'#e84040', fontWeight:700, fontSize:'14px' }}>${item.price?.toFixed(2)}</span>
              </div>
              <p style={{ color:'var(--text2)', fontSize:'12px', lineHeight:1.5, marginBottom:'12px' }}>{item.description?.substring(0,60)}...</p>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={()=>openEdit(item)} style={{ flex:1, padding:'8px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', color:'var(--text2)', fontSize:'12px', cursor:'pointer' }}>✏️ {t.edit}</button>
                <button onClick={()=>handleDelete(item._id)} style={{ flex:1, padding:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', color:'#ef4444', fontSize:'12px', cursor:'pointer' }}>🗑 {t.delete}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, backdropFilter:'blur(4px)' }}
          onClick={()=>setShowModal(false)}>
          <div style={{ background:'var(--card)', borderRadius:'18px', padding:'28px', width:'100%', maxWidth:'520px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', maxHeight:'90vh', overflowY:'auto' }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'22px' }}>
              <h3 style={{ color:'var(--text)', fontSize:'18px', fontWeight:700 }}>{editItem ? t.edit : t.newDish}</h3>
              <button onClick={()=>setShowModal(false)} style={{ background:'transparent', border:'none', color:'var(--text3)', fontSize:'18px', cursor:'pointer' }}>✕</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                <label style={{ color:'var(--text2)', fontSize:'12px', fontWeight:500 }}>{t.dishName}</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g., Truffle Burger" style={inp}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={{ color:'var(--text2)', fontSize:'12px', fontWeight:500 }}>{t.price}</label>
                  <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="12.99" step="0.01" style={inp}/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                  <label style={{ color:'var(--text2)', fontSize:'12px', fontWeight:500 }}>{t.category}</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inp}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                <label style={{ color:'var(--text2)', fontSize:'12px', fontWeight:500 }}>{t.description}</label>
                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Describe the ingredients and taste..." rows={3} style={{ ...inp, resize:'vertical' }}/>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                <label style={{ color:'var(--text2)', fontSize:'12px', fontWeight:500 }}>{t.dishImage}</label>
                <div style={{ border:'2px dashed var(--border)', borderRadius:'12px', cursor:'pointer', overflow:'hidden', minHeight:'120px', display:'flex', alignItems:'center', justifyContent:'center' }}
                  onDrop={handleDrop} onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current.click()}>
                  {form.imagePreview ? (
                    <img src={form.imagePreview} alt="preview" style={{ width:'100%', height:'160px', objectFit:'cover' }}/>
                  ) : (
                    <div style={{ textAlign:'center', padding:'24px' }}>
                      <div style={{ fontSize:'36px', marginBottom:'10px' }}>📸</div>
                      <p style={{ color:'var(--text2)', fontSize:'14px', fontWeight:500 }}>Click or Drag to upload</p>
                      <p style={{ color:'var(--text3)', fontSize:'12px', marginTop:'4px' }}>PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }}/>
              </div>
            </div>

            <div style={{ display:'flex', gap:'12px', marginTop:'22px' }}>
              <button onClick={()=>setShowModal(false)} style={{ flex:1, padding:'12px', background:'transparent', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text2)', fontSize:'14px', cursor:'pointer' }}>{t.cancel}</button>
              <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:'12px', background:'#e84040', border:'none', borderRadius:'10px', color:'#fff', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                {loading ? 'Saving...' : editItem ? `✅ ${t.saveChanges}` : `+ ${t.newDish}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
