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
      className={`premium-card p-2 px-3 flex flex-col justify-center group cursor-grab active:cursor-grabbing border-slate-100 hover:border-blue-100 relative min-h-[52px] ${showMenu ? 'z-50' : 'z-10'}`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: 'inherit' }}>
        {bookmark.isFavorite && (
          <div className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center translate-x-1 -translate-y-1">
            <div className="absolute inset-0 bg-amber-500 rotate-45 translate-x-3 -translate-y-3" />
            <Sparkles size={8} className="text-white relative z-10 mr-[-8px] mt-[-8px]" fill="currentColor" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
          <Globe size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[12px] font-black text-slate-900 truncate leading-tight" title={bookmark.title || 'Sans titre'}>
            {bookmark.title || 'Sans titre'}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 truncate uppercase tracking-widest mt-0.5">
            {getDomain(bookmark.url)}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {bookmark.clicks > 0 && (
            <div 
              className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[9px] font-black tracking-wider border border-rose-100 flex-shrink-0"
              title={`${bookmark.clicks} visites`}
            >
              {bookmark.clicks}
            </div>
          )}

          <div className={`flex items-center gap-0.5 transition-opacity ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-colors"
                title="Options"
              >
                <MoreVertical size={14} />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[100]" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-[110] py-2 overflow-hidden animate-fade-in border-t-4 border-t-slate-900">
                    <div className="px-4 py-2 mb-1 border-b border-slate-50">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Options du lien</p>
                    </div>
                    <button 
                      onClick={() => { setIsEditOpen(true); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit3 size={14} className="text-blue-500" /> Éditer le lien
                    </button>
                    <button 
                      onClick={() => { onDelete(bookmark.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
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
              className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm"
              title="Ouvrir le lien"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
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
