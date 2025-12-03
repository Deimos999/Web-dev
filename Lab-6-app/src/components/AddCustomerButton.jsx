import React from 'react';
import { FaPlus } from 'react-icons/fa';

export default function AddCustomerButton({ onClick }) {
  return (
    <button className="add-button" onClick={onClick}>
      <FaPlus /> Add Customer
    </button>
  );
}
