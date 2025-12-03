import React from 'react';
import { FaSearch } from 'react-icons/fa';

export default function SearchBar({ query, setQuery }) {
  return (
    <input
      type="text"
      className="search-input"
      placeholder="Search..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
