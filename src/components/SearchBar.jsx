import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative group w-full">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
        <Search size={22} />
      </div>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un lien, une description ou un tag..."
        className="w-full pl-16 pr-14 py-5 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50/50 transition-all text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-medium"
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
