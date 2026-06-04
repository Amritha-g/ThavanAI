import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { EmailModal } from '../components/EmailModal.tsx';

export const Obligations = () => {
  const { obligations, fetchData } = useAppContext();
  const [showAdd, setShowAdd] = useState(false);
  const [emailArgs, setEmailArgs] = useState({ isOpen: false, obId: 0 });
  const [formData, setFormData] = useState({ name: '', amount: '', dueDate: '', type: 'supplier', relLevel: 'new', flexLevel: 'none' });

  const handleAdd = async () => {
    if (!formData.name || !formData.amount) return alert('Name and Amount required');
    await fetch('https://thavanai-backend.onrender.com/api/obligations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, amount: Number(formData.amount) })
    });
    fetchData();
    setShowAdd(false);
  };

  const renderOb = (ob: any) => {
    const sClass = ob.score >= 8 ? 'high' : ob.score >= 5 ? 'med' : 'low';
    const rClass = ob.id <= 1 ? 'r1' : ob.id <= 3 ? 'r2' : ob.id <= 4 ? 'r3' : 'r4';
    return (
      <div key={ob.id} className="ob-card">
        <div className={`ob-rank ${rClass}`}>{ob.id}</div>
        <div className="ob-info">
          <div className="ob-name">{ob.name}</div>
          <div className="ob-meta">{ob.type} · {ob.relYears > 0 ? ob.relYears + '-yr relationship' : 'New relationship'} · flexibility: {ob.flexHistory}</div>
          <div className="ob-tags">
            <span className={`tag ${ob.type}`}>{ob.type.toUpperCase()}</span>
            {ob.relCritical && <span className="tag critical">CRITICAL</span>}
            <span className={`ob-score ${sClass}`}>SCORE {ob.score.toFixed(1)}</span>
          </div>
        </div>
        <div className="ob-right">
          <div className="ob-amount">₹{ob.amount.toLocaleString('en-IN')}</div>
          <div className="ob-due">{ob.dueDate}</div>
        </div>
        <div className="ob-btns">
          <button className="btn-draft" onClick={() => setEmailArgs({ isOpen: true, obId: ob.id })}>Draft email</button>
          <button className="btn-secondary" onClick={() => alert('Delay logged.')}>Delay</button>
        </div>
      </div>
    );
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">Obligations</div>
          <div className="page-subtitle">SORTED BY PRIORITY SCORE · DETERMINISTIC ENGINE</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add obligation</button>
      </div>

      {showAdd && (
        <div className="add-form visible">
          <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>NEW OBLIGATION</div>
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Counterparty name</label><input className="form-input" placeholder="e.g. Karim Fabrics" onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="35001" onChange={e=>setFormData({...formData, amount:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Due date</label><input className="form-input" type="date" onChange={e=>setFormData({...formData, dueDate:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Type</label><select className="form-select" onChange={e=>setFormData({...formData, type:e.target.value})}><option value="supplier">Supplier</option><option value="rent">Rent</option><option value="utility">Utility</option><option value="loan">Loan repayment</option><option value="gst">GST</option></select></div>
            <div className="form-field"><label className="form-label">Relationship length</label><select className="form-select" onChange={e=>setFormData({...formData, relLevel:e.target.value})}><option value="new">New (&lt;6 months)</option><option value="medium">Medium (6m–2y)</option><option value="long">Long-term (2y+)</option></select></div>
            <div className="form-field"><label className="form-label">Flexibility</label><select className="form-select" onChange={e=>setFormData({...formData, flexLevel:e.target.value})}><option value="none">None — rigid</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High — very flexible</option></select></div>
          </div>
          <button className="btn-add" onClick={handleAdd}>Add to obligations</button>
        </div>
      )}

      <div className="ob-list">{obligations.map(renderOb)}</div>
      {emailArgs.isOpen && <EmailModal isOpen={true} onClose={() => setEmailArgs({ isOpen: false, obId: 0 })} obId={emailArgs.obId} />}
    </div>
  );
};
