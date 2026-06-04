import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { EmailModal } from '../components/EmailModal.tsx';

export const Receivables = () => {
  const { receivables, fetchData } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [emailArgs, setEmailArgs] = useState<any>({ isOpen: false });
  const [formData, setFormData] = useState({ name: '', amount: '', expectedDate: '', confidence: '' });

  const handleAdd = async () => {
    if (!formData.name || !formData.amount) return alert('Name and Amount required');
    await fetch('https://thavanai-backend.onrender.com/api/receivables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: Number(formData.amount), confidence: Number(formData.confidence) })
    });
    fetchData();
    setShowAdd(false);
  };

  const renderRec = (r: any) => {
    const color = r.confidence >= 80 ? 'var(--green)' : r.confidence >= 60 ? 'var(--amber)' : 'var(--red)';
    const rRing = 11; const cRing = 2 * Math.PI * rRing; const filled = cRing * (r.confidence / 100);
    return (
      <div key={r.id} className="rec-card">
        <div className="conf-ring">
          <svg width="30" height="30" viewBox="0 0 30 30">
            <circle cx="15" cy="15" r={rRing} fill="none" stroke="var(--border)" strokeWidth="2.5" />
            <circle cx="15" cy="15" r={rRing} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={`${filled} ${cRing}`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
          </svg>
          <div className="conf-text" style={{ color: color, fontSize: 7 }}>{r.confidence}%</div>
        </div>
        <div className="ob-info">
          <div className="ob-name">{r.name}</div>
          <div className="ob-meta">{r.expectedDate} · {r.status.replace(/_/g, ' ')}</div>
        </div>
        <div className="ob-right">
          <div className="ob-amount" style={{ color: 'var(--green)' }}>₹{r.amount.toLocaleString('en-IN')}</div>
          <div className="ob-due">{r.confidence}% confidence</div>
        </div>
        <div className="ob-btns">
          <button className="btn-draft" onClick={() => setEmailArgs({ isOpen: true, recName: r.name, recAmount: r.amount })}>Nudge early</button>
        </div>
      </div>
    );
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">Receivables</div>
          <div className="page-subtitle">CONFIDENCE-WEIGHTED INFLOW TRACKER</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add receivable</button>
      </div>

      {showAdd && (
        <div className="add-form visible">
          <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>NEW RECEIVABLE</div>
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Customer name</label><input className="form-input" placeholder="e.g. Customer Murali" onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="15001" onChange={e=>setFormData({...formData, amount:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Expected date</label><input className="form-input" type="date" onChange={e=>setFormData({...formData, expectedDate:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Confidence (%)</label><input className="form-input" type="number" min="0" max="100" placeholder="85" onChange={e=>setFormData({...formData, confidence:e.target.value})} /></div>
          </div>
          <button className="btn-add" onClick={handleAdd}>Add receivable</button>
        </div>
      )}

      <div className="ob-list">{receivables.map(renderRec)}</div>
      {emailArgs.isOpen && <EmailModal isOpen={true} onClose={() => setEmailArgs({ isOpen: false })} recName={emailArgs.recName} recAmount={emailArgs.recAmount} />}
    </div>
  );
};
