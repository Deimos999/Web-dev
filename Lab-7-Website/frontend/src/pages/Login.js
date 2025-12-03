import React, { useState } from 'react';

export default function Login({ onLogin }){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    const res = await fetch('http://localhost:1234/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      onLogin(data.user);
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/>
        </label>
        <label>Password
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/>
        </label>
        <button className="btn">Login</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}
