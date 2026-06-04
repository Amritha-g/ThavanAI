import { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const Loans = () => {
  const { loans, fetchData } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ lender: '', total: '', type: 'family', window: '' });

  const handleAdd = async () => {
    if (!formData.lender || !formData.total) return alert('Name and Amount required');
    await fetch('https://thavanai-backend.onrender.com/api/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchData();
    setShowAdd(false);
  };

  const renderLoan = (l: any) => (
    <div key={l.id} className="loan-card">
      <div className="loan-header">
        <span className="loan-lender syne">{l.lender}</span>
        <span className={`loan-type-tag ${l.type}`}>{l.type.toUpperCase()}</span>
      </div>
      <div className="loan-metrics">
        <div><div className="lm-label">Borrowed</div><div className="lm-val">₹{l.total.toLocaleString('en-IN')}</div></div>
        <div><div className="lm-label">Available</div><div className="lm-val" style={{ color: 'var(--green)' }}>₹{l.available.toLocaleString('en-IN')}</div></div>
        <div><div className="lm-label">Repay window</div><div className="lm-val" style={{ fontSize: 13 }}>{l.window} days</div></div>
      </div>
      {l.relCritical && <div className="rc-badge">REL-CRITICAL — system will never auto-recommend delaying this repayment</div>}
      <div className="loan-note">{l.note}</div>
      <button className="btn-use-buffer" onClick={() => alert('Buffer logic engaged')}>Use as crisis buffer → escape route</button>
    </div>
  );

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">Informal loans</div>
          <div className="page-subtitle">FAMILY · FRIENDS · MONEYLENDERS · CHIT FUNDS</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add loan</button>
      </div>

      {showAdd && (
        <div className="add-form visible">
          <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>NEW INFORMAL LOAN</div>
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Lender name</label><input className="form-input" placeholder="e.g. Cousin Suresh" onChange={e=>setFormData({...formData, lender:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="20000" onChange={e=>setFormData({...formData, total:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Loan type</label><select className="form-select" onChange={e=>setFormData({...formData, type:e.target.value})}><option value="family">Family</option><option value="friend">Friend</option><option value="moneylender">Moneylender</option><option value="chit">Chit fund</option></select></div>
            <div className="form-field"><label className="form-label">Repayment window (days)</label><input className="form-input" type="number" placeholder="60" onChange={e=>setFormData({...formData, window:e.target.value})} /></div>
          </div>
          <button className="btn-add" onClick={handleAdd}>Add loan</button>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>{loans.map(renderLoan)}</div>
    </div>
  );
};
