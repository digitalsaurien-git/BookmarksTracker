import React from 'react';
import { ExternalLink, MoreVertical, Trash2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const BookmarkCard = ({ bookmark, onDelete, onIncrement }) => {
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
      className="premium-card p-3 flex items-center gap-3 group cursor-grab active:cursor-grabbing border-slate-100 hover:border-blue-100"
    >
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
        <Globe size={14} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-bold text-slate-900 truncate">
          {bookmark.title || 'Sans titre'}
        </h3>
        <p className="text-[10px] font-medium text-slate-400 truncate">
          {getDomain(bookmark.url)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {bookmark.clicks > 0 && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mr-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-md text-[9px] font-black tracking-widest shadow-md shadow-blue-500/20" 
            title={`${bookmark.clicks} visites`}
          >
            {bookmark.clicks}
          </motion.div>
        )}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-slate-300 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Options"
          >
            <MoreVertical size={14} />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-fade-in">
                <button 
                  onClick={() => { onDelete(bookmark.id); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </>
          )}
        </div>

        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => onIncrement(bookmark.id)}
          className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
          title="Ouvrir le lien"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;
