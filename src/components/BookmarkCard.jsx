import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trash2, MoreVertical, MoveHorizontal, Tag } from 'lucide-react';

const BookmarkCard = ({ bookmark, onDelete, folders, onMove }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white p-5 rounded-3xl border border-[var(--border-light)] shadow-sm hover:shadow-xl hover:shadow-[#5d4037]/5 transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center relative overflow-hidden group-hover:bg-[var(--accent-soft)] transition-colors">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=64`}
            alt=""
            className="w-6 h-6 z-10"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden absolute inset-0 items-center justify-center text-[var(--accent-current)]">
            <ExternalLink size={20} />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-10">
          <h3 className="text-sm font-black text-[var(--text-primary)] truncate mb-1 group-hover:text-[var(--accent-current)] transition-colors">
            {bookmark.title}
          </h3>
          <p className="text-xs text-[var(--text-dim)] truncate mb-3">
            {new URL(bookmark.url).hostname}
          </p>
          
          {bookmark.description && (
            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
              {bookmark.description}
            </p>
          )}
          {bookmark.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {bookmark.tags.map(tag => (
                <span key={tag} className="text-[9px] font-black px-2 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-dim)] rounded-full uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={() => window.open(bookmark.url, '_blank')}
          className="p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-current)] rounded-xl transition-colors shadow-sm"
        >
          <ExternalLink size={16} />
        </button>
        <button 
          onClick={handleDelete}
          className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {bookmark.private && (
        <div className="absolute top-0 right-0 p-1 bg-amber-100/50 text-amber-600">
          <span className="text-[8px] font-black">PRIVATE</span>
        </div>
      )}


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
