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

  const onDragStart = (e) => {
    e.dataTransfer.setData("bookmarkId", bookmark.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div 
      layout
      draggable
      onDragStart={onDragStart}
      className="premium-card p-4 flex items-center gap-6 group cursor-grab active:cursor-grabbing"
    >
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
        <Globe size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[14px] font-bold text-slate-900 truncate">
          {bookmark.title || 'Sans titre'}
        </h3>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-slate-300 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <MoreVertical size={16} />
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

        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;
