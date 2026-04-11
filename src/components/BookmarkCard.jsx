import React from 'react';
import { ExternalLink, MoreVertical, Trash2, Globe, Edit3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditBookmarkForm from './EditBookmarkForm';

const BookmarkCard = ({ bookmark, onDelete, onIncrement, onUpdate, folders }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  
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
      className="premium-card p-4 flex flex-col gap-3 group cursor-grab active:cursor-grabbing border-slate-100 hover:border-blue-100 relative overflow-hidden"
    >
      {bookmark.isFavorite && (
        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center translate-x-1 -translate-y-1">
          <div className="absolute inset-0 bg-amber-500 rotate-45 translate-x-4 -translate-y-4" />
          <Sparkles size={10} className="text-white relative z-10 mr-[-12px] mt-[-12px]" fill="currentColor" />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
          <Globe size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-black text-slate-900 truncate">
              {bookmark.title || 'Sans titre'}
            </h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">
            {getDomain(bookmark.url)}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-colors"
              title="Options"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-fade-in">
                  <button 
                    onClick={() => { setIsEditOpen(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit3 size={14} /> Éditer
                  </button>
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
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
            title="Ouvrir le lien"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {bookmark.description && (
        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed px-1">
          {bookmark.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2 border-t border-slate-50">
        {bookmark.clicks > 0 && (
          <div 
            className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black tracking-widest border border-blue-100" 
            title={`${bookmark.clicks} visites`}
          >
            {bookmark.clicks} PV
          </div>
        )}
        
        {Array.isArray(bookmark.tags) && bookmark.tags.map((tag, idx) => {
          const isStructured = tag.includes(':');
          const [key, val] = isStructured ? tag.split(':') : [null, tag];
          
          return (
            <span 
              key={idx}
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-tight border ${
                isStructured 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-500 border-slate-100'
              }`}
            >
              {isStructured ? (
                <>
                  <span className="opacity-50 font-medium">{key}:</span>
                  <span>{val}</span>
                </>
              ) : tag}
            </span>
          );
        })}
      </div>

      <AnimatePresence>
        {isEditOpen && (
          <EditBookmarkForm 
            bookmark={bookmark}
            folders={folders}
            onClose={() => setIsEditOpen(false)}
            onSubmit={(updates) => {
              onUpdate(bookmark.id, updates);
              setIsEditOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookmarkCard;
