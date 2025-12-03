import React, { useEffect, useState } from 'react';
import './AdminPanel.css';  

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => load(), []);
  const load = async () => {
    const res = await fetch('http://localhost:1234/api/admin/users', { credentials: 'include' });
    const d = await res.json();
    if (res.ok) setUsers(d.users);
    else setMessage(d.error || 'Error fetching');
  };

  const remove = async (id) => {
    if (!confirm('Delete this user?')) return;
    const res = await fetch(`http://localhost:1234/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) load();
    else alert('Error deleting');
  };

  const startEdit = (u) => setEditing({ ...u, password: '' });

  const saveEdit = async () => {
    const id = editing.id || editing._id;
    const body = { username: editing.username, email: editing.email, role: editing.role };
    if (editing.password) body.password = editing.password;
    const res = await fetch(`http://localhost:1234/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    if (res.ok) { setEditing(null); load(); }
    else {
      const d = await res.json();
      alert(d.error || 'Error saving');
    }
  };

  return (
    <div className="admin-container">
      <div className="panel card">
        <h2>Admin — Users</h2>
        {message && <div className="error">{message}</div>}

        <table className="users-table">
          <thead>
            <tr><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="purple link" onClick={() => startEdit(u)}>Edit</button>
                  <button className="red link" onClick={() => remove(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editing && (
          <div className="edit-panel card">
            <h3>Edit user</h3>
            <label>Username
              <input value={editing.username} onChange={e => setEditing({ ...editing, username: e.target.value })} />
            </label>
            <label>Email
              <input value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} />
            </label>
            <label>Role
              <select value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label>New password (optional)
              <input type="password" value={editing.password} onChange={e => setEditing({ ...editing, password: e.target.value })} />
            </label>
            <div className="actions">
              <button className="purple btn" onClick={saveEdit}>Save</button>
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
