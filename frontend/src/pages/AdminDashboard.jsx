import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PERIODS = [
  { key:'week',     labelKey:'lastWeek',    ordersKey:'ordersPerDay' },
  { key:'month',    labelKey:'lastMonth',   ordersKey:'ordersPerMonth' },
  { key:'3months',  labelKey:'last3Months', ordersKey:'ordersPerThreeMonths' },
  { key:'6months',  labelKey:'last6Months', ordersKey:'ordersPerSixMonths' },
  { key:'year',     labelKey:'lastYear',    ordersKey:'ordersPerYear' },
];

const COLORS = ['#e84040','#f59e0b','#10b981','#3b82f6','#8b5cf6','#f97316'];

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const { t } = useLang();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    fetchStats();
  }, [isAdmin, period]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`/api/admin/stats?period=${period}`);
      setStats(res.data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const curPeriod = PERIODS.find(p => p.key === period);
  const ordersChartTitle = t[curPeriod?.ordersKey] || t.ordersPerDay;
  const revenueChartTitle = `${t.revenueTrend} (${t[curPeriod?.labelKey]})`;

  const tooltipStyle = {
    background: isDark ? '#161b2e' : '#fff',
    border: `1px solid ${isDark ? '#1e2d3d' : '#e2e8f0'}`,
    borderRadius: '10px',
    color: isDark ? '#fff' : '#0f172a'
  };
  const gridColor = isDark ? '#1e2d3d' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#94a3b8';

  const cards = [
    { label:t.totalRevenue, value:`$${(stats.totalRevenue||0).toFixed(2)}`, icon:'💰', color:'#e84040', sub:`$${(stats.periodRevenue||0).toFixed(2)} ${t[curPeriod?.labelKey]||''}` },
    { label:t.totalOrders, value:stats.totalOrders||0, icon:'📦', color:'#3b82f6', sub:`${stats.periodOrders||0} ${t[curPeriod?.labelKey]||''}` },
    { label:t.pendingOrders, value:stats.pendingOrders||0, icon:'⏳', color:'#f59e0b', sub:t.activeTab||'Action needed' },
    { label:t.menuItemsLabel||t.menuItems, value:stats.totalMenuItems||0, icon:'🍽️', color:'#10b981', sub:t.activeDishes||'Active dishes' },
    { label:t.users, value:stats.totalUsers||0, icon:'👥', color:'#8b5cf6', sub:t.registered||'Registered' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ fontSize:'26px', fontWeight:700, color:'var(--text)', marginBottom:'4px' }}>
            Dashboard <span style={{ color:'#e84040' }}>Overview</span>
          </h2>
          <p style={{ color:'var(--text2)', fontSize:'13px' }}>Welcome back! Here's what's happening today.</p>
        </div>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{ padding:'7px 14px', background:period===p.key?'#e84040':'var(--card)', border:`1px solid ${period===p.key?'#e84040':'var(--card-border)'}`, borderRadius:'8px', color:period===p.key?'#fff':'var(--text2)', fontSize:'12px', fontWeight:period===p.key?600:400, cursor:'pointer', boxShadow:'var(--card-shadow)' }}>
              {t[p.labelKey]}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'16px' }}>
        {cards.map((c,i) => (
          <div key={i} style={{ background:'var(--card)', borderRadius:'14px', padding:'20px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)', borderTop:`3px solid ${c.color}`, transition:'all 0.3s' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ color:'var(--text2)', fontSize:'12px', marginBottom:'8px' }}>{c.label}</p>
                <p style={{ fontSize:'24px', fontWeight:800, color:c.color, marginBottom:'4px' }}>{c.value}</p>
                <p style={{ color:'var(--text3)', fontSize:'11px' }}>{c.sub}</p>
              </div>
              <div style={{ width:'40px', height:'40px', borderRadius:'10px', background:c.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>{c.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
        <div style={{ background:'var(--card)', borderRadius:'14px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
          <h3 style={{ color:'var(--text)', fontSize:'15px', fontWeight:600, marginBottom:'18px' }}>{revenueChartTitle}</h3>
          {stats.dailyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.dailyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e84040" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e84040" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="_id" stroke={axisColor} fontSize={11}/>
                <YAxis stroke={axisColor} fontSize={11}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Area type="monotone" dataKey="revenue" stroke="#e84040" fill="url(#rev)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ color:'var(--text3)', textAlign:'center', padding:'60px', fontSize:'14px' }}>📊 No data for this period</div>}
        </div>

        <div style={{ background:'var(--card)', borderRadius:'14px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
          <h3 style={{ color:'var(--text)', fontSize:'15px', fontWeight:600, marginBottom:'18px' }}>{ordersChartTitle}</h3>
          {stats.dailyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor}/>
                <XAxis dataKey="_id" stroke={axisColor} fontSize={11}/>
                <YAxis stroke={axisColor} fontSize={11}/>
                <Tooltip contentStyle={tooltipStyle}/>
                <Bar dataKey="orders" fill="#e84040" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ color:'var(--text3)', textAlign:'center', padding:'60px', fontSize:'14px' }}>📊 No data for this period</div>}
        </div>
      </div>

      {/* Popular Items */}
      {stats.categoryStats?.length > 0 && (
        <div style={{ background:'var(--card)', borderRadius:'14px', padding:'22px', border:'1px solid var(--card-border)', boxShadow:'var(--card-shadow)' }}>
          <h3 style={{ color:'var(--text)', fontSize:'15px', fontWeight:600, marginBottom:'18px' }}>{t.popularItems}</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {stats.categoryStats.map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'10px', background:'var(--bg2)', borderRadius:'10px' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:COLORS[i]+'20', color:COLORS[i], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, flexShrink:0 }}>#{i+1}</div>
                <span style={{ color:'var(--text)', fontSize:'14px', fontWeight:500, flex:1 }}>{item._id}</span>
                <div style={{ width:'120px', height:'6px', background:isDark?'#1e2d3d':'#e2e8f0', borderRadius:'3px', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:'3px', background:COLORS[i], width:`${(item.count/stats.categoryStats[0].count)*100}%` }}/>
                </div>
                <span style={{ color:COLORS[i], fontWeight:700, fontSize:'14px', minWidth:'30px' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
