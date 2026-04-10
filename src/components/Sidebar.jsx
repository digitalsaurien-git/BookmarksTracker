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
  const isExpanded = folder.isExpanded;
  const subfolders = folders.filter(f => f.parentId === folder.id);
  const isSelected = selectedId === folder.id;

  return (
    <div className="flex flex-col">
      <div 
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-blue-600/10 text-blue-600' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
        style={{ marginLeft: `${depth * 16}px` }}
        onClick={() => onSelect(folder.id)}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(folder.id);
          }}
          className={`p-1 rounded transition-colors ${subfolders.length === 0 ? 'opacity-0' : 'hover:bg-slate-200'}`}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <Folder size={16} className={isSelected ? 'text-blue-500' : 'opacity-60'} />
        <span className="text-[13px] font-semibold truncate flex-1">{folder.name}</span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e, folder);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
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
      bookmarks.addFolder(name, parent.id.startsWith('root-') ? null : parent.id);
    }
    setContextMenu(null);
  };

  const rootFolders = bookmarks.folders.filter(f => f.parentId === null && f.type === bookmarks.activeContext);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
      {/* Brand */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <Bookmark size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-widest uppercase text-slate-900">Digital Saurien</span>
        </div>

        {/* Perso / Pro Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => bookmarks.setContext('perso')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${
              bookmarks.activeContext === 'perso' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={14} /> Perso
          </button>
          <button
            onClick={() => bookmarks.setContext('pro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${
              bookmarks.activeContext === 'pro' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={14} /> Pro
          </button>
        </div>
      </div>

      <div className="px-5 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-3 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Bibliothèque</span>
          <button 
            onClick={() => handleAddSubfolder({ id: 'root-' + bookmarks.activeContext, name: 'Racine' })}
            className="p-1 hover:text-blue-600 transition-colors"
          >
            <FolderPlus size={14} />
          </button>
        </div>

        <div className="space-y-0.5">
          {rootFolders.length === 0 && (
            <p className="px-3 py-4 text-xs text-slate-400 italic">Aucun dossier créé.</p>
          )}
          {rootFolders.map(folder => (
            <FolderItem 
              key={folder.id}
              folder={folder}
              folders={bookmarks.folders}
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

      <div className="p-6 border-t border-slate-100">
         <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
               <User size={14} />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-slate-900 truncate">Utilisateur</p>
               <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Synchronisé</p>
            </div>
         </div>
      </div>

      {contextMenu && (
        <div 
          className="fixed inset-0 z-50"
          onClick={() => setContextMenu(null)}
        >
          <div 
            className="absolute bg-white border border-slate-200 rounded-xl shadow-2xl py-2 w-48 overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button 
              onClick={() => handleAddSubfolder(contextMenu.folder)}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-3"
            >
              <Plus size={14} /> Ajouter sous-dossier
            </button>
            <button 
              onClick={() => {
                const newName = prompt('Nouveau nom :', contextMenu.folder.name);
                if (newName) bookmarks.updateFolder(contextMenu.folder.id, { name: newName });
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-3"
            >
              <Edit2 size={14} /> Renommer
            </button>
            <div className="h-[1px] bg-slate-100 my-1" />
            <button 
              onClick={handleDeleteFolder}
              className="w-full text-left px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-50 flex items-center gap-3"
            >
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
