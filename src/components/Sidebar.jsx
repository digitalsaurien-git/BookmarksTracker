import React, { useState } from 'react';
import { Briefcase, User, FolderPlus, Folder, ChevronRight, ChevronDown, Plus, Trash2, Settings, Download, Search, X } from 'lucide-react';
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
          className={`p-1 rounded hover:bg-black/5 transition-colors ${hasChildren ? 'opacity-100' : 'opacity-0'}`}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <button
          onClick={() => onSelect(folder.id)}
          className={`flex-1 flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-all text-left ${
            isSelected 
              ? 'bg-[var(--accent-soft)] text-[var(--accent-current)] font-bold shadow-sm border border-[var(--accent-current)]/10' 
              : 'text-gray-600 hover:bg-black/5 hover:text-black'
          }`}
        >
          <Folder size={18} className={isSelected ? 'text-[var(--accent-current)]' : 'text-gray-400'} />
          <span className="truncate flex-1">{folder.name}</span>
          {count > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isSelected ? 'bg-[var(--accent-current)] text-white' : 'bg-black/5 text-gray-400'
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
    <aside className="w-80 sidebar-beige border-r border-black/5 flex flex-col z-20 shadow-xl shadow-black/5">
      <div className="p-8 flex-1 flex flex-col overflow-hidden">
        <div className="mb-10">
          <h1 className="text-2xl font-black text-[#5d4037] leading-tight flex items-center gap-3 mb-1">
            <span className="w-2 h-8 bg-[#8d6e63] rounded-full" />
            BOOKMARKS
          </h1>
          <p className="text-[10px] font-black tracking-[0.3em] text-[#a1887f] uppercase ml-5 opacity-70">
            DIGITAL SAURIEN
          </p>
        </div>

        {/* Search Bar integrated in Sidebar */}
        <div className="relative mb-8 px-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1887f]" size={18} />
          <input
            type="text"
            placeholder="Rechercher un favori..."
            value={bookmarks.searchQuery}
            onChange={(e) => bookmarks.setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#efebe9]/50 border border-[#d7ccc8] rounded-2xl focus:ring-2 focus:ring-[#8d6e63]/20 focus:border-[#8d6e63] transition-all outline-none text-sm placeholder-[#a1887f]/60 text-[#5d4037] font-medium"
          />
          {bookmarks.searchQuery && (
            <button 
              onClick={() => bookmarks.setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex p-1 bg-[#efebe9] rounded-2xl mb-8">
          <button
            onClick={() => bookmarks.setContext('perso')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
              bookmarks.activeContext === 'perso' 
                ? 'bg-white text-[#8d6e63] shadow-md border border-[#d7ccc8]/30' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User size={14} /> Perso
          </button>
          <button
            onClick={() => bookmarks.setContext('pro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
              bookmarks.activeContext === 'pro' 
                ? 'bg-white text-[#5d4037] shadow-md border border-[#d7ccc8]/30' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Briefcase size={14} /> Boulot
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 px-2 text-[10px] font-black text-[#a1887f] uppercase tracking-[0.2em] opacity-80">
          <span>ARBORESCENCE</span>
          <button 
            onClick={() => handleAddSubfolder({ id: 'root-' + bookmarks.activeContext, name: 'Racine' })}
            className="p-1 hover:text-[#5d4037] transition-colors"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1 custom-scrollbar text-[#5d4037]">
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
            className="p-6 border-t border-[#d7ccc8] bg-[#efebe9]/50"
          >
            <form onSubmit={submitNewFolder} className="space-y-3">
              <label className="text-[10px] font-black text-[#a1887f] uppercase tracking-widest">Nouveau dossier dans {isAddingInFolder.name}</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Nom..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="flex-1 text-xs py-2 bg-white border border-[#d7ccc8] rounded-xl outline-none focus:border-[#8d6e63] px-3 transition-colors"
                />
                <button type="submit" className="p-2 bg-[#8d6e63] text-white rounded-xl shadow-md hover:bg-[#5d4037] transition-colors">
                  <Plus size={16} />
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
