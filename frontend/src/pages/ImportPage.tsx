import { useState, useEffect } from 'react';

export const ImportPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [manual, setManual] = useState({ desc: '', amount: '', type: 'payable', date: '' });

  const fetchTx = async () => {
    try {
      const r = await fetch('https://thavanai-backend.onrender.com/api/transactions');
      setTransactions(await r.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTx(); }, []);

  const handleManual = async () => {
    if (!manual.desc || !manual.amount) return alert('Desc and amount required');
    await fetch('https://thavanai-backend.onrender.com/api/transactions/manual', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manual)
    });
    fetchTx();
  };

  const handleUpload = async (e: any) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;
    try {
      for (const file of files as any[]) {
        const formData = new FormData();
        formData.append('file', file);

        const r = await fetch('https://thavanai-backend.onrender.com/api/transactions/parse', {
          method: 'POST',
          body: formData
        });
        if (!r.ok) throw new Error('File processing failed on server for ' + file.name);
      }
      fetchTx();
    } catch (err: any) {
      alert('Error uploading files: ' + err.message);
    }
  };

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title syne">Import financial data</div>
          <div className="page-subtitle">BANK PDFS · RECEIPT PHOTOS · INVOICES · CSV EXPORTS</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="section-lbl">Universal Document Importer</div>
        <label className="upload-zone" style={{ display: 'block', position: 'relative', padding: 36 }}>
          <svg viewBox="0 0 36 36" className="upload-icon" fill="none" style={{ width: 44, height: 44, marginBottom: 12 }}>
            <rect x="4" y="6" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 18h12M18 12v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="upload-title" style={{ fontSize: 14 }}>Drop financial documents or images here (Click to upload)</div>
          <div className="upload-sub" style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6 }}>Bank statements · Invoices · Receipt photos · Handwritten notes<br/>Supported: .pdf, .csv, .xlsx, .jpg, .png</div>
          <input type="file" multiple className="upload-input" accept=".pdf,.csv,.xlsx,.jpg,.png,.jpeg" onChange={handleUpload} />
        </label>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title syne">Manual entry</span><span style={{ fontSize: 10, color: 'var(--text3)' }} className="mono">quick add</span></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-field"><label className="form-label">Description</label><input className="form-input" placeholder="e.g. Fabric payment to Karim" value={manual.desc} onChange={e=>setManual({...manual, desc:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Amount (₹)</label><input className="form-input" type="number" placeholder="25001" value={manual.amount} onChange={e=>setManual({...manual, amount:e.target.value})} /></div>
            <div className="form-field"><label className="form-label">Type</label>
              <select className="form-select" value={manual.type} onChange={e=>setManual({...manual, type:e.target.value})}>
                <option value="payable">Payable (money out)</option>
                <option value="receivable">Receivable (money in)</option>
              </select>
            </div>
            <div className="form-field"><label className="form-label">Date</label><input className="form-input" type="date" value={manual.date} onChange={e=>setManual({...manual, date:e.target.value})} /></div>
          </div>
          <button className="btn-add" onClick={handleManual}>Add transaction</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title syne">Parsed transactions</span><span className="mono" style={{ fontSize: 10, color: 'var(--text3)' }}>{transactions.length} records</span></div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {transactions.length === 0 ? <div style={{ textAlign: 'center', padding: 24, fontSize: 12, color: 'var(--text3)', fontFamily: "JetBrains Mono" }}>No records yet</div> : 
             transactions.map(t => (
               <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7 }}>
                 <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, fontFamily: "JetBrains Mono", border: '1px solid', ...(t.type==='payable'?{background:'var(--red-bg)',color:'var(--red)',borderColor:'var(--red-border)'}:{background:'var(--green-bg)',color:'var(--green)',borderColor:'var(--green-border)'}) }}>{t.type.toUpperCase()}</span>
                 <span style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>{t.desc}</span>
                 <span style={{ fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 500, color: t.type==='payable'?'var(--red)':'var(--green)' }}>₹{t.amount.toLocaleString('en-IN')}</span>
                 <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: "JetBrains Mono" }}>{t.date}</span>
                 <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: "JetBrains Mono", maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.source}</span>
               </div>
             ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
