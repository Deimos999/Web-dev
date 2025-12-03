import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import AddCustomerButton from './components/AddCustomerButton';
import UserTable from './components/UserTable';
import './App.css';

export default function App() {
  const [query, setQuery] = useState('');

  const handleAddCustomer = () => {
    alert('Add Customer clicked!');
  };

  return (
    <div className="container">
      <div className="search-add-container">
        <SearchBar query={query} setQuery={setQuery} />
        <AddCustomerButton onClick={handleAddCustomer} />
      </div>
      <UserTable query={query} />
    </div>
  );
}
