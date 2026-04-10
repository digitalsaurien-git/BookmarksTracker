import React from 'react';
import BookmarkCard from './BookmarkCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, LayoutGrid } from 'lucide-react';

const MainContent = ({ bookmarks, folderId, onAdd }) => {
  const isSearching = bookmarks.searchQuery.length > 0;
  
  const displayBookmarks = isSearching 
    ? bookmarks.bookmarks 
    : bookmarks.bookmarks.filter(b => b.folderId === folderId);

  const currentFolder = bookmarks.folders.find(f => f.id === folderId);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <LayoutGrid size={24} className="text-[var(--accent-current)]" />
              {isSearching ? `Résultats pour "${bookmarks.searchQuery}"` : currentFolder?.name}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {displayBookmarks.length} lien{displayBookmarks.length !== 1 ? 's' : ''} trouvé{displayBookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {displayBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border-dashed border-2 border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Bookmark size={32} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-400">Aucun bookmark ici</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              {isSearching ? "Essayez d'autres mots clés ou parcourez vos dossiers." : "Commencez par ajouter un lien utile dans ce dossier."}
            </p>
            {!isSearching && (
              <button 
                onClick={onAdd}
                className="mt-6 px-6 py-2 bg-[var(--accent-current)] rounded-xl font-medium hover:scale-105 transition-transform"
              >
                Ajouter mon premier lien
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
};

export default MainContent;
