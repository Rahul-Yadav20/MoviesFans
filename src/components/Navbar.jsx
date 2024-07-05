// src/components/Navbar.js
import React from 'react';

const Navbar = ({ onSearch }) => {
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      onSearch(e.target.value);
    }
  };

  return (
    <nav className="navbar">
      <input
        type="text"
        placeholder="Search for a movie..."
        onKeyDown={handleSearch}
      />
    </nav>
  );
};

export default Navbar;
