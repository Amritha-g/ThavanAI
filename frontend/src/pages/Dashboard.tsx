import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, BarController, LineController } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, BarController, LineController);

export const Dashboard = ({ navigate }: { navigate: (page: string) => void }) => {
  const { dashboardState, obligations, receivables, loans, theme, mode } = useAppContext();
  const isCons = mode === 'conservative';
  const d2z = isCons ? Math.max(0, dashboardState.currentD2Z - 5) : dashboardState.currentD2Z;
  const filteredReceivables = isCons ? receivables.filter((r: any) => r.confidence >= 80) : receivables;
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstRef = useRef<any>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://thavanai-backend.onrender.com/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(err => console.error("Failed to fetch alerts", err));
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    const isDark = theme === 'dark';
    
    const labels = [], inArr = [], outArr = [], balArr = [];
    let cash = 80000;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      labels.push((d.getDate()) + '/' + (d.getMonth() + 1));
      let inp = 0, out = 0;
      const delay = isCons ? 5 : 0;
      if (i === 3) out += 25001;
      if (i === 7) out += 35001;
      if (i === 11 + delay) inp += 15001;
      if (i === 11) out += 12400;
      if (i === 14 + delay) inp += 8000;
      if (i === 15) out += 8000;
      if (i === 18) out += 3200;
      if (i === 23 + delay) inp += 32000;
      inArr.push(inp); outArr.push(-out); cash = cash + inp - out; balArr.push(cash);
    }
    
    const gc = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const tc = isDark ? '#5A6070' : '#9C9890';
    
    if (chartInstRef.current) chartInstRef.current.destroy();
    
    chartInstRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { type: 'bar', data: inArr, backgroundColor: isDark ? 'rgba(0,229,160,0.55)' : 'rgba(0,102,68,0.5)', borderRadius: 3, order: 2 },
          { type: 'bar', data: outArr, backgroundColor: isDark ? 'rgba(255,77,106,0.55)' : 'rgba(192,25,42,0.5)', borderRadius: 3, order: 2 },
          { type: 'line', data: balArr, borderColor: isDark ? '#4D9EFF' : '#1A4A8A', borderWidth: 1.5, pointRadius: 0, tension: 0.35, yAxisID: 'y2', order: 1 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false, backgroundColor: isDark ? '#22262D' : '#fff', titleColor: isDark ? '#E8EAF0' : '#1A1814', bodyColor: isDark ? '#9BA3B2' : '#6B6560', borderColor: isDark ? '#343840' : '#DDD9CE', borderWidth: 1 }
        },
        scales: {
          x: { grid: { color: gc }, ticks: { font: { size: 9, family: 'JetBrains Mono' }, maxTicksLimit: 8, color: tc }, border: { display: false } },
          y: { grid: { color: gc }, ticks: { font: { size: 9, family: 'JetBrains Mono' }, color: tc, callback: (v: any) => v === 0 ? '0' : '₹' + (Math.abs(v) / 1000).toFixed(0) + 'k' }, border: { display: false } },
          y2: { position: 'right', grid: { display: false }, ticks: { font: { size: 9, family: 'JetBrains Mono' }, color: isDark ? '#4D9EFF' : '#1A4A8A', callback: (v: any) => '₹' + (v / 1000).toFixed(0) + 'k' }, border: { display: false } },
        }
      }
    });

    return () => {
      if (chartInstRef.current) chartInstRef.current.destroy();
    };
  }, [theme, mode]);

  const renderOb = (ob: any) => {
    const sClass = ob.score >= 8 ? 'high' : ob.score >= 5 ? 'med' : 'low';
    const rClass = ob.id <= 1 ? 'r1' : ob.id <= 3 ? 'r2' : ob.id <= 4 ? 'r3' : 'r4';
    return (
      <div key={ob.id} className="ob-card" style={{ padding: '9px 12px' }}>
        <div className={`ob-rank ${rClass}`} style={{ width: 24, height: 24, fontSize: 10 }}>{ob.id}</div>
        <div className="ob-info">
          <div className="ob-name" style={{ fontSize: 12 }}>{ob.name}</div>
          <div className="ob-meta">{ob.dueDate} · <span className={`ob-score ${sClass}`} style={{ display: 'inline-flex' }}>{ob.score.toFixed(1)}</span></div>
        </div>
        <div className="ob-right">
          <div className="ob-amount" style={{ fontSize: 13 }}>₹{ob.amount.toLocaleString('en-IN')}</div>
        </div>
      </div>
    );
  };

  const renderRec = (r: any) => {
    const color = r.confidence >= 80 ? 'var(--green)' : r.confidence >= 60 ? 'var(--amber)' : 'var(--red)';
    const rRing = 11; const cRing = 2 * Math.PI * rRing; const filled = cRing * (r.confidence / 100);
    return (
      <div key={r.id} className="rec-card" style={{ padding: '9px 12px' }}>
        <div className="conf-ring">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r={rRing} fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle cx="15" cy="15" r={rRing} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={`${filled} ${cRing}`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
          </svg>
          <div className="conf-text" style={{ color: color, fontSize: 7 }}>{r.confidence}%</div>
        </div>
        <div className="ob-info">
          <div className="ob-name" style={{ fontSize: 12 }}>{r.name}</div>
          <div className="ob-meta">{r.expectedDate}</div>
        </div>
        <div className="ob-right">
          <div className="ob-amount" style={{ fontSize: 13, color: 'var(--green)' }}>₹{r.amount.toLocaleString('en-IN')}</div>
        </div>
      </div>
    );
  };

  const renderLoan = (l: any) => (
    <div key={l.id} className="loan-card" style={{ padding: '9px 12px' }}>
      <div className="loan-header" style={{ marginBottom: 4 }}>
        <span className="loan-lender syne" style={{ fontSize: 12 }}>{l.lender}</span>
        <span className={`loan-type-tag ${l.type}`}>{l.type.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div>
          <div className="lm-label">Available</div>
          <div className="lm-val" style={{ fontSize: 14, color: 'var(--green)' }}>₹{l.available.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div className="lm-label">Window</div>
          <div className="lm-val" style={{ fontSize: 14 }}>{l.window}d</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page active" id="page-dashboard">
      <div className="page-header">
        <div>
          <div className="page-title syne">Cash Intelligence Dashboard</div>
          <div className="page-subtitle">LAST UPDATED · TODAY 09:41 · SENTHIL GARMENTS</div>
        </div>
        <button className="btn-primary" onClick={() => navigate('upload')}>+ Import data</button>
      </div>

      {alerts.length > 0 ? (
        <div className="alerts-container" style={{ marginBottom: 20 }}>
          <div className="section-label syne" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pulse-dot"></span> AI INSIGHTS & TRENDS {!dashboardState.currentD2Z && <span style={{fontSize: 9, opacity: 0.5}}>(DEMO MODE)</span>}
          </div>
          <div className="alerts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {alerts.map((alert, idx) => (
              <div key={idx} className={`alert-card severity-${alert.severity}`} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
                <div className="alert-accent" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: alert.severity === 'high' ? 'var(--red)' : alert.severity === 'medium' ? 'var(--amber)' : 'var(--blue)' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span className="mono" style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase' }}>{alert.metric} · {alert.type.replace('_', ' ')}</span>
                  <span className={`severity-tag ${alert.severity}`} style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: 'var(--bg3)', border: '1px solid var(--border)' }}>{alert.severity.toUpperCase()}</span>
                </div>
                <div className="syne" style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{alert.message}</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8 }}>{alert.insight}</div>
                <div style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 14 }}>→</span> {alert.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="alerts-stable" style={{ marginBottom: 20, padding: '10px 16px', borderRadius: 8, background: 'rgba(0,229,160,0.05)', border: '1px solid rgba(0,229,160,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }}></div>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)' }}>All systems stable. No urgent financial anomalies detected.</span>
        </div>
      )}

      <div className="stat-row">
        <div className={`stat-card ${d2z >= 30 ? 'green' : d2z >= 10 ? 'amber' : 'red'}`}>
          <div className="stat-label">days to zero</div>
          <div className="stat-value">{d2z}</div>
          <div className="stat-sub">{d2z >= 30 ? 'Green zone · healthy' : d2z >= 10 ? 'Amber zone · watch closely' : 'Red zone · act now'}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">total payables / 30d</div>
          <div className="stat-value">₹83,600</div>
          <div className="stat-sub">{obligations.length} obligations pending</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">expected inflows / 30d</div>
          <div className="stat-value">₹{isCons ? '23,000' : '55,000'}</div>
          <div className="stat-sub">{filteredReceivables.length} {isCons ? 'high-confidence receivables' : 'receivables tracked'}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">informal buffer</div>
          <div className="stat-value">₹30,000</div>
          <div className="stat-sub">{loans.length} loans available</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title syne">30-day cash flow</span>
            <div className="chart-legend">
              <div className="legend-item"><div className="legend-swatch" style={{ background: 'var(--green)' }}></div>Inflows</div>
              <div className="legend-item"><div className="legend-swatch" style={{ background: 'var(--red)' }}></div>Outflows</div>
              <div className="legend-item"><div className="legend-swatch" style={{ background: 'var(--blue)', borderRadius: '50%', height: 8, width: 8 }}></div>Balance</div>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrap"><canvas ref={chartRef}></canvas></div>
          </div>
        </div>

        <div className="crisis-card">
          <div className="crisis-top" onClick={() => setCrisisOpen(!crisisOpen)}>
            <div className="crisis-indicator red"></div>
            <div className="crisis-text">
              <div className="crisis-date syne">Next tight day: Oct 14</div>
              <div className="crisis-desc">Rent + GST + Karim Fabrics converge</div>
            </div>
            <div className="crisis-num">
              <div className="crisis-days-num red mono">8</div>
              <div className="crisis-days-label">days away</div>
            </div>
          </div>
          {crisisOpen && (
            <div className="crisis-expanded" style={{ display: 'block' }}>
              <div className="cob-table">
                <div className="cob-row"><span className="cob-name">Rent · Landlord</span><span className="cob-amt" style={{ color: 'var(--red)' }}>₹25,000</span></div>
                <div className="cob-row"><span className="cob-name">GST-R3B · Government</span><span className="cob-amt" style={{ color: 'var(--purple)' }}>₹12,400</span></div>
                <div className="cob-row"><span className="cob-name">Karim Fabrics · Supplier</span><span className="cob-amt" style={{ color: 'var(--amber)' }}>₹35,000</span></div>
                <div className="cob-row"><span className="cob-name" style={{ fontWeight: 700 }}>Total obligations</span><span className="cob-amt">₹72,400</span></div>
                <div className="cob-row"><span className="cob-name" style={{ color: 'var(--text3)' }}>Projected cash Oct 14</span><span className="cob-amt" style={{ color: 'var(--text3)' }}>₹61,000</span></div>
              </div>
              <div className="shortfall-chip">
                <span className="shortfall-label">Cash shortfall on Oct 14</span>
                <span className="shortfall-amt">−₹11,400</span>
              </div>
              <div className="escape-header">AI escape routes</div>
              <div className="escape" onClick={() => navigate('scenarios')}>
                <div className="escape-text">View AI Escape Scenarios</div>
                <div className="escape-impact">Runway can be extended up to 22 days</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="dash-grid-3">
        <div className="card">
          <div className="card-header"><span className="card-title syne">Top obligations</span><span style={{ fontSize: 10, color: 'var(--text3)' }} className="mono">by priority score</span></div>
          <div className="card-body" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {obligations?.slice(0, 3).map(renderOb)}
            </div>
            <button className="btn-secondary" style={{ width: '100%', marginTop: 10, fontSize: 11 }} onClick={() => navigate('obligations')}>View all obligations →</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title syne">Inflow confidence</span><span style={{ fontSize: 10, color: 'var(--text3)' }} className="mono">receivables tracker</span></div>
          <div className="card-body" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {filteredReceivables?.slice(0, 3).map(renderRec)}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title syne">Loan buffers</span><span style={{ fontSize: 10, color: 'var(--text3)' }} className="mono">informal capital</span></div>
          <div className="card-body" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {loans?.slice(0, 3).map(renderLoan)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
