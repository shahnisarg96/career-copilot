import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/util.js';

export default function SkillsEditor(){
  const [items,setItems]=useState([]);
  const [saving,setSaving]=useState(false);
  const token = localStorage.getItem('token');

  useEffect(()=>{
    fetch(`${API_BASE}/admin/skills`,{ headers:{ 'Authorization': `Bearer ${token}` }}).then(r=>r.json()).then(setItems);
  },[]);

  async function save(){
    setSaving(true);
    await fetch(`${API_BASE}/admin/skills`,{ method:'PUT', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify(items)});
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {items.map((it,idx)=> (
        <div key={it.id||idx} className="card bg-base-200 p-4 space-y-2">
          <input className="input input-bordered" value={it.title} onChange={e=>{ const next=[...items]; next[idx]={...it,title:e.target.value}; setItems(next); }} />
          <input className="input input-bordered" value={it.category||''} onChange={e=>{ const next=[...items]; next[idx]={...it,category:e.target.value}; setItems(next); }} />
        </div>
      ))}
      <div className="flex gap-2">
        <button className="btn" onClick={()=>setItems([...items,{title:'',category:''}])}>Add Skill</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
      </div>
    </div>
  );
}
