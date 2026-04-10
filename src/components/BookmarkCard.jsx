import React from 'react';
import { ExternalLink, MoreVertical, Trash2, Move, Clock, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const BookmarkCard = ({ bookmark, onDelete, onMove }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  
  // Extract domain for a cleaner look
  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <motion.div 
      layout
      className="premium-card p-6 flex flex-col h-full group"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
          <Globe size={20} />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-300 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-fade-in">
                <button 
                  onClick={() => { onMove(bookmark.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Move size={16} /> Déplacer
                </button>
                <button 
                  onClick={() => { onDelete(bookmark.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 mb-8">
        <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight mb-2 line-clamp-2">
          {bookmark.title || 'Sans titre'}
        </h3>
        <p className="text-[14px] font-medium text-slate-400 line-clamp-2 leading-relaxed">
          {bookmark.description || 'Aucune description disponible pour ce favori.'}
        </p>
      </div>

      <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-[11px] font-black text-slate-300 uppercase tracking-widest">
          <Clock size={12} />
          {getDomain(bookmark.url)}
        </div>
        
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-sm"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;
