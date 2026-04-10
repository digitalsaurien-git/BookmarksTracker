import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Trash2, MoreVertical, MoveHorizontal, Tag, Globe, Link } from 'lucide-react';

const BookmarkCard = ({ bookmark, onDelete, folders, onMove }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const hostname = new URL(bookmark.url).hostname;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative flex flex-col h-full"
    >
      <div className="flex gap-4 mb-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0 group-hover:bg-blue-50 transition-colors">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
            alt=""
            className="w-5 h-5"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <Link size={18} className="hidden text-blue-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-0.5">
            {bookmark.title}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
             {hostname}
          </p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <MoreVertical size={16} />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 shadow-2xl rounded-xl py-2 z-10"
              >
                <button 
                  onClick={() => { window.open(bookmark.url, '_blank'); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ExternalLink size={14} /> Ouvrir
                </button>
                <button 
                  onClick={() => { setShowMoveMenu(true); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <MoveHorizontal size={14} /> Déplacer
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button 
                  onClick={() => { onDelete(); setShowOptions(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1">
        {bookmark.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {bookmark.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mt-auto pt-4">
        {bookmark.tags?.map(tag => (
          <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {showMoveMenu && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMoveMenu(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-6">Déplacer vers...</h3>
              <div className="space-y-1.5 max-h-60 overflow-y-auto px-1 custom-scrollbar">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => { onMove(folder.id); setShowMoveMenu(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      bookmark.folderId === folder.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMoveMenu(false)} className="w-full mt-6 py-2 text-xs font-bold text-slate-400">Annuler</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookmarkCard;
