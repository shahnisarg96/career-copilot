import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/util.js';

export default function EducationEditor(){
  const [items,setItems]=useState([]);
  const [saving,setSaving]=useState(false);
  const token = localStorage.getItem('token');

  useEffect(()=>{
    fetch(`${API_BASE}/admin/education`,{ headers:{ 'Authorization': `Bearer ${token}` }}).then(r=>r.json()).then(setItems);
  },[]);

  async function save(){
    setSaving(true);
    await fetch(`${API_BASE}/admin/education`,{ method:'PUT', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify(items)});
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {items.map((it,idx)=> (
        <div key={it.id||idx} className="card bg-base-200 p-4 space-y-2">
          <input className="input input-bordered" value={it.school} onChange={e=>{ const next=[...items]; next[idx]={...it,school:e.target.value}; setItems(next); }} />
          <input className="input input-bordered" value={it.degree} onChange={e=>{ const next=[...items]; next[idx]={...it,degree:e.target.value}; setItems(next); }} />
        </div>
      ))}
      <div className="flex gap-2">
        <button className="btn" onClick={()=>setItems([...items,{school:'',degree:''}])}>Add Education</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
      </div>
    </div>
  );
}
