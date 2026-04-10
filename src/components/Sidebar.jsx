import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  Search, 
  Bookmark, 
  X,
  User,
  Briefcase,
  FolderPlus,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FolderItem = ({ 
  folder, 
  folders, 
  bookmarks, 
  depth, 
  onSelect, 
  selectedId, 
  onContextMenu, 
  onToggleExpand 
}) => {
  const isExpanded = bookmarks.data.expandedFolders.includes(folder.id);
  const subfolders = folders.filter(f => f.parentId === folder.id);
  const isSelected = selectedId === folder.id;

  return (
    <div className="flex flex-col">
      <div 
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-blue-600/10 text-blue-400' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        }`}
        style={{ paddingLeft: `${(depth * 12) + 12}px` }}
        onClick={() => onSelect(folder.id)}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(folder.id);
          }}
          className={`p-1 rounded transition-colors ${subfolders.length === 0 ? 'opacity-0' : 'hover:bg-slate-700'}`}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Folder size={16} className={isSelected ? 'text-blue-500' : 'text-slate-500'} />
        <span className="text-xs font-semibold truncate flex-1">{folder.name}</span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, folder);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && subfolders.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {subfolders.map(sub => (
              <FolderItem 
                key={sub.id}
                folder={sub}
                folders={folders}
                bookmarks={bookmarks}
                depth={depth + 1}
                onSelect={onSelect}
                selectedId={selectedId}
                onContextMenu={onContextMenu}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ bookmarks, onSelectFolder, selectedFolderId, onAddBookmark }) => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e, folder) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, folder });
  };

  const handleDeleteFolder = () => {
    if (confirm(`Supprimer le dossier "${contextMenu.folder.name}" et tout son contenu ?`)) {
      bookmarks.deleteFolder(contextMenu.folder.id);
      setContextMenu(null);
    }
  };

  const handleAddSubfolder = (parent) => {
    const name = prompt('Nom du sous-dossier :');
    if (name) {
      bookmarks.addFolder(name, parent.id === 'root-' + bookmarks.activeContext ? null : parent.id);
    }
    setContextMenu(null);
  };

  const rootFolders = bookmarks.data.folders.filter(f => f.parentId === null && f.type === bookmarks.activeContext);

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col z-20 shadow-2xl font-sans">
      <div className="p-8 flex-1 flex flex-col overflow-hidden">
        <div className="mb-10 pl-2">
          <h1 className="text-xl font-extrabold text-white leading-tight flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Bookmark className="text-white" size={16} />
            </div>
            BOOKMARKS
          </h1>
          <p className="text-[9px] font-bold tracking-[0.3em] text-slate-500 uppercase mt-2 pl-11">
            DIGITAL SAURIEN
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 px-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={bookmarks.searchQuery}
            onChange={(e) => bookmarks.setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-xs placeholder-slate-600 text-slate-200 font-medium"
          />
        </div>

        <div className="flex p-1 bg-slate-800/50 rounded-xl mb-8">
          <button
            onClick={() => bookmarks.setContext('perso')}
            className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold transition-all uppercase tracking-widest ${
              bookmarks.activeContext === 'perso' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Perso
          </button>
          <button
            onClick={() => bookmarks.setContext('pro')}
            className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold transition-all uppercase tracking-widest ${
              bookmarks.activeContext === 'pro' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Pro
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 px-2 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60">
          <span>CATALOGUE</span>
          <button 
            onClick={() => handleAddSubfolder({ id: 'root-' + bookmarks.activeContext, name: 'Racine' })}
            className="p-1 hover:text-blue-400 transition-colors"
          >
            <FolderPlus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-0.5 custom-scrollbar">
          {rootFolders.map(folder => (
            <FolderItem 
              key={folder.id}
              folder={folder}
              folders={bookmarks.data.folders}
              bookmarks={bookmarks}
              depth={0}
              onSelect={onSelectFolder}
              selectedId={selectedFolderId}
              onContextMenu={handleContextMenu}
              onToggleExpand={bookmarks.toggleFolderExpand}
            />
          ))}
        </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed inset-0 z-50"
          onClick={() => setContextMenu(null)}
        >
          <div 
            className="absolute bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 w-48 overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button 
              onClick={() => handleAddSubfolder(contextMenu.folder)}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-3"
            >
              <Plus size={14} /> Ajouter sous-dossier
            </button>
            <button 
              onClick={() => {
                const newName = prompt('Nom du dossier :', contextMenu.folder.name);
                if (newName) bookmarks.updateFolder(contextMenu.folder.id, { name: newName });
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-700 flex items-center gap-3"
            >
              <Edit2 size={14} /> Renommer
            </button>
            <div className="h-[1px] bg-slate-700 my-1" />
            <button 
              onClick={handleDeleteFolder}
              className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-400/10 flex items-center gap-3"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Profile / Stats */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/50">
         <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold text-xs">
               {bookmarks.activeContext === 'pro' ? 'P' : 'U'}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[10px] font-bold text-slate-300 truncate">Utilisateur Cloud</p>
               <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Synchronisé</p>
            </div>
         </div>
      </div>

      <style jsx>{`
         .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
