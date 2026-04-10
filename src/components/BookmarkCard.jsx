import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Trash2, MoreVertical, MoveHorizontal, Tag, Globe, Link } from 'lucide-react';

const BookmarkCard = ({ bookmark, onDelete, folders, onMove }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const hostname = new URL(bookmark.url).hostname;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full"
    >
      <div className="flex gap-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-50 transition-colors border border-slate-100">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
            alt=""
            className="w-6 h-6 z-10"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden absolute inset-0 items-center justify-center text-blue-500">
            <Link size={20} />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-10">
          <h3 className="text-sm font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">
            {bookmark.title}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
             <Globe size={10} /> {hostname}
          </p>
          
          {bookmark.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed font-medium">
              {bookmark.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {bookmark.tags?.map(tag => (
          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={() => window.open(bookmark.url, '_blank')}
          className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"
        >
          <ExternalLink size={14} />
        </button>
        <button 
          onClick={() => setShowMoveMenu(true)}
          className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-slate-100"
        >
          <MoveHorizontal size={14} />
        </button>
        <button 
          onClick={handleDelete}
          className="p-2 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-100"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <AnimatePresence>
        {showMoveMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowMoveMenu(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-2xl p-8 border border-slate-200 shadow-2xl shadow-slate-900/20"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                 <MoveHorizontal className="text-blue-500" /> Déplacer le favori
              </h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      onMove(folder.id);
                      setShowMoveMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      bookmark.folderId === folder.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setShowMoveMenu(false)}
                className="w-full mt-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
);
};

export default BookmarkCard;
