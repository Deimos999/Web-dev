import React, { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function App(){
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login'); // login | register | profile | admin

  useEffect(()=>{
    fetch('http://localhost:1234/api/auth/me', { credentials: 'include' })
      .then(r=>r.json())
      .then(data=>{
        if (data.user) {
          setUser(data.user);
          setPage('profile');
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch('http://localhost:1234/api/auth/logout', { method:'POST', credentials:'include' });
    setUser(null);
    setPage('login');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">User Manager</h1>
        <nav>
          {!user && <>
            <button className="link" onClick={()=>setPage('login')}>Login</button>
            <button className="link" onClick={()=>setPage('register')}>Register</button>
          </>}
          {user && <>
            <span className="greeting">Hi, {user.username}</span>
            <button className="link" onClick={()=>setPage('profile')}>Profile</button>
            {user.role === 'admin' && <button className="link" onClick={()=>setPage('admin')}>Admin</button>}
            <button className="link" onClick={handleLogout}>Logout</button>
          </>}
        </nav>
      </header>

      <main className="container">
        {!user && page === 'login' && <Login onLogin={(u)=>{ setUser(u); setPage('profile'); }} />}
        {!user && page === 'register' && <Register onRegister={(u)=>{ setUser(u); setPage('profile'); }} />}
        {user && page === 'profile' && <Profile user={user} onUserChange={u=>setUser(u)} />}
        {user && page === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>

      <footer className="footer">Made By Irakli Tavadze, Who doesn't like Designs like Emotional people do.</footer>
    </div>
  );
}

export default App;