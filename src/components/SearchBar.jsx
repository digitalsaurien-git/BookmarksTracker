import React from 'react';
import { Search, X, Command, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-3xl group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/5 blur-2xl group-focus-within:bg-blue-500/10 transition-all duration-700 rounded-[2rem] -z-10" />
      
      <div className="premium-glass rounded-[2rem] flex items-center px-8 py-5 gap-6 border-slate-100/50 hover:border-slate-200 focus-within:border-blue-500/50 transition-all duration-300">
        <div className="text-slate-300 group-focus-within:text-blue-500 transition-colors">
          <Search size={22} strokeWidth={2.5} />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Rechercher un lien, une description ou un tag..."
          className="flex-1 bg-transparent border-none outline-none text-slate-800 font-bold text-base placeholder:text-slate-300 selection:bg-blue-100"
        />

        <div className="flex items-center gap-4">
          {value ? (
            <button 
              onClick={() => onChange('')}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          ) : (
             <div className="flex items-center gap-1.5 bg-slate-100/50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Command size={12} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 tracking-wider">/</span>
             </div>
          )}
          
          <div className="h-6 w-[1px] bg-slate-100" />
          
          <button className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Suggestion hints or results count can go here */}
    </div>
  );
};

export default SearchBar;
