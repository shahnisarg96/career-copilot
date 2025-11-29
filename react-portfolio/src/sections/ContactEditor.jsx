import { useEffect, useMemo, useState } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaPhone } from 'react-icons/fa';
import { BsMicrosoftTeams } from 'react-icons/bs';
import { API_BASE } from '../utils/util.js';

export default function ContactEditor(){
  const [items,setItems]=useState([]);
  const [saving,setSaving]=useState(false);
  const token = localStorage.getItem('token');

  const iconOptions = useMemo(() => ([
    { key: 'FaLinkedin', label: 'LinkedIn', icon: <FaLinkedin /> },
    { key: 'FaGithub', label: 'GitHub', icon: <FaGithub /> },
    { key: 'FaEnvelope', label: 'Email', icon: <FaEnvelope /> },
    { key: 'FaPhone', label: 'Phone', icon: <FaPhone /> },
    { key: 'FaTwitter', label: 'Twitter/X', icon: <FaTwitter /> },
    { key: 'BsMicrosoftTeams', label: 'Microsoft Teams', icon: <BsMicrosoftTeams /> },
  ]), []);

  useEffect(()=>{
    fetch(`${API_BASE}/admin/contact`,{ headers:{ 'Authorization': `Bearer ${token}` }}).then(r=>r.json()).then(setItems);
  },[]);

  async function save(){
    setSaving(true);
    await fetch(`${API_BASE}/admin/contact`,{ method:'PUT', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify(items)});
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {items.map((it,idx)=> (
        <div key={it.id||idx} className="card bg-base-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Icon</span>
              </label>
              <div className="join w-full">
                <select
                  className="select select-bordered join-item w-full"
                  value={it.icon || ''}
                  onChange={e=>{ const next=[...items]; next[idx]={...it,icon:e.target.value}; setItems(next); }}
                >
                  <option value="" disabled>Select an icon</option>
                  {iconOptions.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
                <span className="btn join-item" title="Preview">
                  {iconOptions.find(o=>o.key===it.icon)?.icon}
                </span>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Label</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="e.g., GitHub"
                value={it.label || ''}
                onChange={e=>{ const next=[...items]; next[idx]={...it,label:e.target.value}; setItems(next); }}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Link</span>
              </label>
              <input
                className="input input-bordered w-full"
                placeholder="https://... or mailto:..."
                value={it.href || ''}
                onChange={e=>{ const next=[...items]; next[idx]={...it,href:e.target.value}; setItems(next); }}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button className="btn" onClick={()=>setItems([...items,{icon:'',label:'',href:''}])}>Add Contact</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save'}</button>
      </div>
    </div>
  );
}
