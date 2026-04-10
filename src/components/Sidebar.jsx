import React, { useState } from 'react';
import { Briefcase, User, FolderPlus, Folder, ChevronRight, ChevronDown, Plus, Trash2, Settings, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContextMenu from './ContextMenu';

const FolderItem = ({ folder, folders, bookmarks, depth, onSelect, selectedId, onContextMenu, onToggleExpand }) => {
  const hasChildren = folders.some(f => f.parentId === folder.id);
  const isOpen = folder.isExpanded;
  const count = bookmarks.getBookmarkCount(folder.id);
  const isSelected = selectedId === folder.id;

  const childFolders = folders.filter(f => f.parentId === folder.id);

  return (
    <div className="flex flex-col">
      <div 
        className="group flex items-center gap-2"
        onContextMenu={(e) => onContextMenu(e, folder)}
      >
        <button
          onClick={() => onToggleExpand(folder.id)}
          className={`p-1 rounded hover:bg-white/5 transition-colors ${hasChildren ? 'opacity-100' : 'opacity-0'}`}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <button
          onClick={() => onSelect(folder.id)}
          className={`flex-1 flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm transition-all text-left ${
            isSelected 
              ? 'bg-[var(--accent-soft)] text-[var(--accent-current)] border border-[var(--accent-current)]/10' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Folder size={16} className={isSelected ? 'text-[var(--accent-current)]' : 'text-gray-500'} />
          <span className="truncate flex-1">{folder.name}</span>
          {count > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isSelected ? 'bg-[var(--accent-current)] text-white' : 'bg-white/5 text-gray-500'
            }`}>
              {count}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ marginLeft: '24px' }}
          >
            {childFolders.map(child => (
              <FolderItem 
                key={child.id}
                folder={child}
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
  const [isAddingInFolder, setIsAddingInFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');

  const handleContextMenu = (e, folder) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      folder
    });
  };

  const handleAddSubfolder = (parentFolder) => {
    setIsAddingInFolder(parentFolder);
    setNewFolderName('');
  };

  const submitNewFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      bookmarks.addFolder(newFolderName.trim(), isAddingInFolder.id);
      setIsAddingInFolder(null);
    }
  };

  const contextMenuOptions = contextMenu ? [
    { label: 'Ajouter un lien', icon: Plus, onClick: () => { 
      onSelectFolder(contextMenu.folder.id);
      onAddBookmark(); 
    } },
    { label: 'Ajouter un dossier', icon: FolderPlus, onClick: () => handleAddSubfolder(contextMenu.folder) },

    { separator: true },
    { label: 'Propriétés', icon: Settings, onClick: () => console.log('Props') },
    { label: 'Exporter les favoris', icon: Download, onClick: () => console.log('Export') },
    { separator: true },
    { label: 'Supprimer', icon: Trash2, danger: true, onClick: () => bookmarks.deleteFolder(contextMenu.folder.id) },
  ] : [];

  const rootFolders = bookmarks.data.folders.filter(f => f.parentId === null && f.type === bookmarks.activeContext);

  return (
    <aside className="w-72 glass border-r border-white/5 flex flex-col z-20">
      <div className="p-6 flex-1 flex flex-col overflow-hidden">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 flex items-center gap-2">
          :: BOOKMARKS ::
        </h1>

        <div className="flex p-1 bg-white/5 rounded-xl mb-6">
          <button
            onClick={() => bookmarks.setContext('perso')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              bookmarks.activeContext === 'perso' 
                ? 'bg-[var(--accent-perso)] text-white shadow-lg' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <User size={14} /> Perso
          </button>
          <button
            onClick={() => bookmarks.setContext('pro')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              bookmarks.activeContext === 'pro' 
                ? 'bg-[var(--accent-pro)] text-white shadow-lg' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Briefcase size={14} /> Boulot
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          <span>ARBORESCENCE</span>
          <button 
            onClick={() => handleAddSubfolder({ id: 'root-' + bookmarks.activeContext, name: 'Racine' })}
            className="p-1 hover:text-[var(--accent-current)] transition-colors"
          >
            <FolderPlus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1 custom-scrollbar">
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

      <AnimatePresence>
        {isAddingInFolder && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 border-t border-white/5 bg-white/5"
          >
            <form onSubmit={submitNewFolder} className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nouveau dossier dans {isAddingInFolder.name}</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nom..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 text-xs py-1.5"
                />
                <button type="submit" className="p-1.5 bg-[var(--accent-current)] rounded-lg">
                  <Plus size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          options={contextMenuOptions} 
          onClose={() => setContextMenu(null)} 
        />
      )}
    </aside>
  );
};

export default Sidebar;
