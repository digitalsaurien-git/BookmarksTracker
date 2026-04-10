import React from 'react';
import BookmarkCard from './BookmarkCard';
import { ChevronRight, LayoutGrid, Layers, Ghost, Sparkles } from 'lucide-react';

const MainContent = ({ bookmarks, folderId, onAdd }) => {
  const currentFolder = bookmarks.folders.find(f => f.id === folderId);
  const folderBookmarks = bookmarks.bookmarks.filter(b => b.folderId === folderId);
  
  const folderPath = [];
  let temp = currentFolder;
  while (temp) {
    folderPath.unshift(temp);
    temp = bookmarks.folders.find(f => f.id === temp.parentId);
  }

  if (folderBookmarks.length === 0 && !bookmarks.searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
        <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center text-slate-300 mb-10 shadow-inner">
          <Ghost size={64} strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Votre bibliothèque est prête</h2>
        <p className="text-slate-400 max-w-sm font-medium leading-relaxed mb-10">
          Commencez à organiser vos liens favoris en un seul endroit. Épuré, rapide et sécurisé.
        </p>
        <button 
          onClick={onAdd}
          className="flex items-center gap-3 bg-blue-600 px-10 py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/30 transition-all active:scale-95"
        >
          <Sparkles size={20} /> Ajouter mon premier lien
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Breadcrumbs & Title */}
      <div className="flex items-end justify-between border-b border-slate-100 pb-10">
        <div>
          <nav className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Digital Saurien</span>
            {folderPath.map((f, i) => (
              <React.Fragment key={f.id}>
                <ChevronRight size={12} className="opacity-40" />
                <span className={`${i === folderPath.length - 1 ? 'text-blue-500' : 'hover:text-slate-600 cursor-pointer'}`}>
                  {f.name}
                </span>
              </React.Fragment>
            ))}
          </nav>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            {currentFolder?.name || 'Tous les favoris'}
          </h1>
          <div className="flex items-center gap-2 mt-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <Layers size={14} />
            <span>{folderBookmarks.length} ressources disponibles</span>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <div className="p-2 bg-white rounded-lg shadow-sm text-slate-900">
              <LayoutGrid size={18} />
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {folderBookmarks.map(bookmark => (
          <BookmarkCard 
            key={bookmark.id} 
            bookmark={bookmark}
            onDelete={bookmarks.deleteBookmark}
            onMove={bookmarks.moveBookmark}
          />
        ))}
      </div>
    </div>
  );
};

export default MainContent;
