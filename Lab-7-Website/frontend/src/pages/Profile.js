import React, { useEffect, useState } from 'react';

export default function Profile({ user, onUserChange }){
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(()=>{
    fetch('http://localhost:1234/api/user/profile', { credentials:'include' })
      .then(r=>r.json())
      .then(d => {
        setProfile(d.user);
        setEditing({ username: d.user?.username || '', email: d.user?.email || '', password: '' });
      });
  }, []);

  const update = async () => {
    setMessage('');
    const res = await fetch('http://localhost:1234/api/user/profile', {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify(editing)
    });
    const d = await res.json();
    if (res.ok) {
      setMessage('Saved');
      onUserChange(prev => ({ ...prev, username: editing.username }));
    } else {
      setMessage(d.error || 'Error');
    }
    setTimeout(()=>setMessage(''), 3000);
  };

  const remove = async () => {
    if (!confirm('Delete your account? This is permanent.')) return;
    const res = await fetch('http://localhost:1234/api/user/profile', { method:'DELETE', credentials:'include' });
    if (res.ok) {
      // reload page to show logged out state
      window.location.reload();
    } else {
      alert('Could not delete');
    }
  };

  if (!profile) return <div className="card">Loading...</div>;

  return (
    <div className="card">
      <h2>Your Profile</h2>
      <label>Username
        <input value={editing.username} onChange={e=>setEditing({...editing, username:e.target.value})}/>
      </label>
      <label>Email
        <input value={editing.email} onChange={e=>setEditing({...editing, email:e.target.value})}/>
      </label>
      <label>New password (leave blank to keep)
        <input type="password" value={editing.password} onChange={e=>setEditing({...editing, password:e.target.value})}/>
      </label>
      <div className="actions">
        <button className="btn" onClick={update}>Save</button>
        <button className="btn danger" onClick={remove}>Delete account</button>
      </div>
      {message && <div className="info">{message}</div>}
    </div>
  );
}
