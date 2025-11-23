import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { API_BASE } from '../utils/util.js';

export default function Publish(){
  const navigate = useNavigate();
  const [status,setStatus] = useState('idle');

  async function handlePublish(){
    const token = localStorage.getItem('token');
    if(!token){
      navigate('/login');
      return;
    }
    setStatus('publishing');
    try{
      const res = await fetch(`${API_BASE}/admin/publish`,{
        method:'POST',
        headers:{ 'Authorization': `Bearer ${token}` }
      });
      if(!res.ok) throw new Error('Failed to publish');
      const { publicUrl } = await res.json();
      setStatus('success');
      // Save last published URL
      localStorage.setItem('portfolioUrl', publicUrl);
    }catch(err){
      setStatus('error');
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Publish Portfolio</h1>
      <p className="mb-4">Generate a public, shareable link for your portfolio and resume.</p>
      <button className="btn btn-primary" onClick={handlePublish} disabled={status==='publishing'}>
        {status==='publishing' ? 'Publishing…' : 'Publish'}
      </button>
      {status==='success' && (
        <div className="alert alert-success mt-4">
          Published! Your link: <a className="link" href={localStorage.getItem('portfolioUrl')} target="_blank" rel="noreferrer">{localStorage.getItem('portfolioUrl')}</a>
        </div>
      )}
      {status==='error' && (
        <div className="alert alert-error mt-4">Something went wrong. Try again.</div>
      )}
    </div>
  );
}
