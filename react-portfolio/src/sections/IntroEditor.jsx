import { useEffect, useState } from 'react';
import { API_BASE } from '../utils/util.js';

export default function IntroEditor(){
  const [data,setData]=useState(null);
  const [saving,setSaving]=useState(false);
  const token = localStorage.getItem('token');

  useEffect(()=>{
    fetch(`${API_BASE}/admin/intro`,{ headers:{ 'Authorization': `Bearer ${token}` }}).then(r=>r.json()).then(setData);
  },[]);

  if(!data) return <div>Loading…</div>;

  async function save(){
    setSaving(true);
    await fetch(`${API_BASE}/admin/intro`,{ method:'PUT', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify(data)});
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <label className="form-control">
        <span className="label-text">Name</span>
        <input className="input input-bordered" value={data.name} onChange={e=>setData({...data,name:e.target.value})} />
      </label>
      <label className="form-control">
        <span className="label-text">Description</span>
        <textarea className="textarea textarea-bordered" value={data.description} onChange={e=>setData({...data,description:e.target.value})} />
      </label>
      <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
    </div>
  );
}
