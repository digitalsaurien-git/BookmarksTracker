import React from 'react';
import BookmarkCard from './BookmarkCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, LayoutGrid, SearchX, Plus, Star, Clock } from 'lucide-react';

const MainContent = ({ bookmarks, folderId, onAdd }) => {
  const isSearching = bookmarks.searchQuery.length > 0;
  const isRoot = folderId?.startsWith('root-');
  
  const displayBookmarks = isSearching 
    ? bookmarks.bookmarks 
    : isRoot 
      ? bookmarks.bookmarks 
      : bookmarks.bookmarks.filter(b => b.folderId === folderId);

  const currentFolder = bookmarks.folders.find(f => f.id === folderId);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${bookmarks.activeContext === 'pro' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                {bookmarks.activeContext}
             </div>
             {currentFolder?.parentId && (
               <span className="text-slate-300 font-bold text-xs">/ {bookmarks.folders.find(f => f.id === currentFolder.parentId)?.name}</span>
             )}
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            {isSearching ? "Recherche globale" : (currentFolder?.name || (isRoot ? "Tableau de bord" : "Favoris"))}
          </h2>
          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">
            {displayBookmarks.length} ressource{displayBookmarks.length !== 1 ? 's' : ''} disponible{displayBookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {!isSearching && (
          <button 
            onClick={onAdd}
            className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Nouveau Marque-page
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {displayBookmarks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 text-slate-200">
              {isSearching ? <SearchX size={48} /> : <Bookmark size={48} />}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              {isSearching ? "Aucune correspondance" : "Votre bibliothèque est prête"}
            </h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
              {isSearching 
                ? "Nous n'avons trouvé aucun lien correspondant à vos critères de recherche." 
                : "Organisez vos liens favoris en un seul endroit sécurisé et intuitif."}
            </p>
            {!isSearching && (
              <button 
                onClick={onAdd}
                className="mt-10 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
              >
                Ajouter mon premier lien maintenant
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {displayBookmarks.map((bookmark) => (
                <BookmarkCard 
                  key={bookmark.id} 
                  bookmark={bookmark} 
                  onDelete={() => bookmarks.deleteBookmark(bookmark.id)}
                  folders={bookmarks.folders}
                  onMove={(newFolderId) => bookmarks.moveBookmark(bookmark.id, newFolderId)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainContent;
