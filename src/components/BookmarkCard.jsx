import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trash2, MoreVertical, MoveHorizontal, Tag } from 'lucide-react';

const BookmarkCard = ({ bookmark, onDelete, folders, onMove }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=64`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="glass rounded-2xl p-5 border border-white/5 hover:border-[var(--accent-current)]/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 p-2 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
          <img 
            src={faviconUrl} 
            alt="favicon" 
            className="w-full h-full object-contain"
            onError={(e) => { e.target.src = 'https://lucide.dev/favicon.ico'; }}
          />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5"
          >
            <MoreVertical size={18} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 glass border border-white/10 rounded-xl shadow-2xl z-20 py-1 overflow-hidden">
              <button 
                onClick={() => { setShowMoveMenu(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
              >
                <MoveHorizontal size={14} /> Déplacer
              </button>
              <button 
                onClick={onDelete}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-white line-clamp-1 mb-1 group-hover:text-[var(--accent-current)] transition-colors">
          {bookmark.title}
        </h3>
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 text-xs truncate block hover:text-gray-300 flex items-center gap-1"
        >
          {bookmark.url}
          <ExternalLink size={10} />
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {bookmark.tags.map((tag, index) => (
          <span 
            key={index} 
            className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-gray-400 border border-white/5 flex items-center gap-1"
          >
            <Tag size={8} /> {tag}
          </span>
        ))}
      </div>

      {showMoveMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass w-full max-w-sm rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Déplacer vers...</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => {
                    onMove(folder.id);
                    setShowMoveMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    bookmark.folderId === folder.id 
                      ? 'bg-[var(--accent-soft)] border-[var(--accent-current)]/30 text-[var(--accent-current)]' 
                      : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowMoveMenu(false)}
              className="w-full mt-6 py-3 text-gray-400 hover:text-white font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BookmarkCard;
