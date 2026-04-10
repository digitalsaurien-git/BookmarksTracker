import React, { useState } from 'react';
import { Briefcase, User, FolderPlus, Folder, ChevronRight, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ bookmarks, onSelectFolder, selectedFolderId }) => {
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      bookmarks.addFolder(newFolderName.trim());
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  return (
    <aside className="w-72 glass border-r border-white/5 flex flex-col z-20">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
          BookmarksTracker
        </h1>

        <div className="flex p-1 bg-white/5 rounded-xl mb-8">
          <button
            onClick={() => bookmarks.setContext('perso')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              bookmarks.activeContext === 'perso' 
                ? 'bg-[var(--accent-perso)] text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User size={16} /> Perso
          </button>
          <button
            onClick={() => bookmarks.setContext('pro')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              bookmarks.activeContext === 'pro' 
                ? 'bg-[var(--accent-pro)] text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Briefcase size={16} /> Pro
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Dossiers</span>
          <button 
            onClick={() => setIsAddingFolder(true)}
            className="p-1 hover:text-[var(--accent-current)] transition-colors"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-2 -mr-2">
          {bookmarks.folders.map(folder => (
            <div key={folder.id} className="group flex items-center">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedFolderId === folder.id 
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-current)] border border-[var(--accent-current)]/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Folder size={16} className={selectedFolderId === folder.id ? 'text-[var(--accent-current)]' : 'text-gray-500'} />
                <span className="truncate">{folder.name}</span>
                {selectedFolderId === folder.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
              
              {!folder.id.startsWith('root-') && (
                <button
                  onClick={() => bookmarks.deleteFolder(folder.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-all ml-1"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isAddingFolder && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-auto p-4 border-t border-white/5 bg-white/5"
          >
            <form onSubmit={handleAddFolder} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Nom du dossier..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="flex-1 text-xs"
              />
              <button type="submit" className="p-2 bg-[var(--accent-current)] rounded-lg">
                <FolderPlus size={14} />
              </button>
              <button onClick={() => setIsAddingFolder(false)} className="p-2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;
