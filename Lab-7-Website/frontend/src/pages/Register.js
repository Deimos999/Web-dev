import React, { useState } from 'react';

export default function Register({ onRegister }){
  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('http://localhost:1234/api/auth/register', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      onRegister(data.user);
    } else {
      setError(data.error || 'Register failed');
    }
  };

  return (
    <div className="card">
      <h2>Create account</h2>
      <form onSubmit={submit}>
        <label>Username
          <input value={username} onChange={e=>setUsername(e.target.value)} required/>
        </label>
        <label>Email
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </label>
        <label>Password
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        </label>
        <button className="btn">Register</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
