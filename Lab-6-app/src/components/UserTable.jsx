import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatusPill from './StatusPill';
import { FaTrash } from 'react-icons/fa';

export default function UserTable({ query }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const toggleSelect = (id) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter((userId) => userId !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const handleDelete = () => {
    setUsers(users.filter((user) => !selectedCustomers.includes(user.id)));
    setSelectedCustomers([]);
  };

  useEffect(() => {
    async function fetchData() {
      const res = await axios.get('https://jsonplaceholder.typicode.com/users');
      const data = res.data.map((u, i) => ({
        id: i + 1,
        name: u.name,
        description: u.company.catchPhrase,
        status: ['Open', 'Paid', 'Inactive', 'Due'][i % 4],
        rate: (Math.floor(Math.random() * 100) + 50).toFixed(2),
        balance: (Math.floor(Math.random() * 600) - 300).toFixed(2),
        deposit: (Math.floor(Math.random() * 1000) + 100).toFixed(2),
        currency: 'CAD'
      }));
      setUsers(data);
      setFiltered(data);
    }
    fetchData();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.description.toLowerCase().includes(q)
      )
    );
  }, [query, users]);

  return (
    <div className="user-table-container">
      {selectedCustomers.length > 0 && (
        <button className="delete-button" onClick={handleDelete}>
          <FaTrash /> Delete
        </button>
      )}
      <table className="user-table">
        <thead>
          <tr>
            <th></th> {}
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Rate</th>
            <th>Balance</th>
            <th>Deposit</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedCustomers.includes(user.id)}
                  onChange={() => toggleSelect(user.id)}
                  className="row-checkbox"
                />
              </td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.description}</td>
              <td>
                <StatusPill status={user.status} />
              </td>
              <td className={user.rate >= 0 ? 'amount-positive' : 'amount-negative'}>
                ${user.rate}
              </td>
              <td className={user.balance >= 0 ? 'amount-positive' : 'amount-negative'}>
                ${user.balance}
              </td>
              <td>${user.deposit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
