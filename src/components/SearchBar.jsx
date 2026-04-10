import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
        <Search size={18} />
      </div>
      <input
        type="text"
        placeholder="Rechercher un titre, un lien ou un tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-[var(--accent-current)] focus:bg-white/10 transition-all text-sm outline-none"
      />
    </div>
  );
};

export default SearchBar;
