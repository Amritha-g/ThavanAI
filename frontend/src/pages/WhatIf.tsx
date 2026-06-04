import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const WhatIf = () => {
  const [params, setParams] = useState({ bal: 80000, muraliEarly: 0, karimDelay: 0, loanDraw: 0, buf: 10000 });
  const [d2z, setD2z] = useState(14);
  const [explain, setExplain] = useState('Current scenario: Oct 14 remains the critical tight day.');
  const [nlInput, setNlInput] = useState('');
  const [isProcessingNL, setIsProcessingNL] = useState(false);

  const handleNLSubmit = async () => {
    if (!nlInput.trim()) return;
    setIsProcessingNL(true);
    try {
      const res = await fetch('https://thavanai-backend.onrender.com/api/ai/whatif-nl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: nlInput, currentParams: params })
      });
      if (res.ok) {
        const newParams = await res.json();
        setParams(newParams);
        setNlInput('');
      } else {
        alert('Could not process scenario. Please ensure backend is running with Gemini API key.');
      }
    } catch (e) {
      console.error(e);
      alert('Error connecting to AI simulator.');
    }
    setIsProcessingNL(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleNLSubmit();
  }

  useEffect(() => {
    fetch('https://thavanai-backend.onrender.com/api/dashboard/whatif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then(r => r.json()).then(data => {
      setD2z(data.d2z);
      
      const explains = [];
      if (params.muraliEarly > 0) explains.push(`Murali paying ${params.muraliEarly} day(s) early pulls ₹15,000 inflow forward.`);
      if (params.karimDelay > 0) explains.push(`Karim delay of ${params.karimDelay} day(s) removes Oct pressure.`);
      if (params.loanDraw > 0) explains.push(`Drawing ₹${params.loanDraw.toLocaleString('en-IN')} from Suresh adds buffer.`);
      if (explains.length === 0) explains.push('No adjustments. Oct 14 remains the tight day.');
      explains.push(`Projected runway: ${data.d2z} days with safety buffer ₹${params.buf.toLocaleString('en-IN')}.`);
      setExplain(explains.join(' '));
    }).catch(e => console.error(e));
  }, [params]);

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">What-if simulator</div>
          <div className="page-subtitle">ADJUST VARIABLES · INSTANT D2Z RECALCULATION</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', gap: 10, padding: '16px 20px' }}>
           <input 
             className="form-input" 
             style={{ flex: 1, margin: 0 }} 
             placeholder="Type a scenario e.g. 'What if I delay Karim by 5 days and draw 5000 from Suresh?'" 
             value={nlInput} 
             onChange={e => setNlInput(e.target.value)} 
             onKeyDown={handleKeyDown}
             disabled={isProcessingNL}
           />
           <button 
             className="btn-add" 
             style={{ padding: '0 24px', margin: 0, height: '42px', justifySelf: 'flex-end', alignSelf: 'center' }}
             onClick={handleNLSubmit}
             disabled={isProcessingNL}
           >
             {isProcessingNL ? 'Thinking...' : 'Simulate'}
           </button>
        </div>
      </div>
      <div className="wi-card">
        <div style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Adjust scenario parameters</div>
        <div className="wi-row"><span className="wi-label">Current bank balance (₹)</span><input className="wi-input" type="number" value={params.bal} onChange={e=>setParams({...params, bal:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Murali payment (days early)</span><input className="wi-input" type="number" min="0" max="7" value={params.muraliEarly} onChange={e=>setParams({...params, muraliEarly:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Karim Fabrics delay (days)</span><input className="wi-input" type="number" min="0" max="14" value={params.karimDelay} onChange={e=>setParams({...params, karimDelay:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Draw from Suresh loan (₹)</span><input className="wi-input" type="number" min="0" max="20000" value={params.loanDraw} onChange={e=>setParams({...params, loanDraw:parseInt(e.target.value)||0})} /></div>
        <div className="wi-row"><span className="wi-label">Safety buffer threshold (₹)</span><input className="wi-input" type="number" value={params.buf} onChange={e=>setParams({...params, buf:parseInt(e.target.value)||0})} /></div>
        <div className="wi-result-box">
          <div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "JetBrains Mono", marginBottom: 4 }}>PROJECTED DAYS TO ZERO</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: "JetBrains Mono" }}>Based on your adjustments</div>
          </div>
          <div className="wi-result-val" style={{ color: d2z >= 30 ? 'var(--green)' : d2z >= 15 ? 'var(--amber)' : 'var(--red)' }}>{d2z} days</div>
        </div>
        <div className="wi-explain">{explain}</div>
      </div>
    </div>
  );
};
