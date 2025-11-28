import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/util.js';

export default function AboutEditor(){
  const [data,setData]=useState(null);
  const [saving,setSaving]=useState(false);
  const token = localStorage.getItem('token');

  useEffect(()=>{
    fetch(`${API_BASE}/admin/about`,{ headers:{ 'Authorization': `Bearer ${token}` }}).then(r=>r.json()).then(arr=>setData(arr?.[0]||{}));
  },[]);

  if(!data) return <div>Loading…</div>;

  async function save(){
    setSaving(true);
    await fetch(`${API_BASE}/admin/about`,{ method:'PUT', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify(data)});
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <label className="form-control">
        <span className="label-text">Tagline</span>
        <input className="input input-bordered" value={data.tagline||''} onChange={e=>setData({...data,tagline:e.target.value})} />
      </label>
      <label className="form-control">
        <span className="label-text">Description (HTML)</span>
        <textarea className="textarea textarea-bordered" value={data.description||''} onChange={e=>setData({...data,description:e.target.value})} />
      </label>
      <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
    </div>
  );
}
