import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, 
  Library, Hash, Briefcase, User, MoreVertical,
  PlusCircle, FolderPlus, Compass, Settings, Trash2
} from 'lucide-react';

const Sidebar = ({ bookmarks, onSelectFolder, selectedFolderId }) => {
  const { folders, activeContext, setContext, addFolder } = bookmarks;

  const handleToggle = (id) => {
    bookmarks.toggleFolderExpand(id);
  };

  const getSubfolders = (parentId) => {
    return folders.filter(f => f.parentId === parentId);
  };

  const FolderItem = ({ folder, level = 0 }) => {
    const isSelected = selectedFolderId === folder.id;
    const isExpanded = folder.isExpanded;
    const hasChildren = getSubfolders(folder.id).length > 0;

    return (
      <div className="mb-2">
        <div 
          className={`group flex items-center px-5 py-3 rounded-2xl transition-all cursor-pointer ${
            isSelected ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-[1.02]' : 'hover:bg-slate-50 text-slate-600'
          }`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <div 
            onClick={(e) => {
              if (hasChildren) {
                e.stopPropagation();
                handleToggle(folder.id);
              }
            }}
            className="w-5 h-5 flex items-center justify-center text-slate-300 group-hover:text-slate-500 rounded-md transition-colors"
          >
            {hasChildren && (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
          </div>
          <div className="flex-1 flex items-center gap-4 min-w-0">
             <div className={`${isSelected ? 'text-blue-400' : 'text-slate-400 opacity-60'}`}>
                {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
             </div>
             <span className={`text-[13px] font-black truncate leading-none ${isSelected ? 'text-white' : 'text-slate-700'}`}>
               {folder.name}
             </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Supprimer le dossier "${folder.name}" et tout son contenu ?`)) {
                bookmarks.deleteFolder(folder.id);
              }
            }}
            className={`p-1.5 opacity-0 group-hover:opacity-100 rounded-lg transition-all ${
              isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'
            }`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-l border-slate-100 ml-7 mt-1"
            >
              {getSubfolders(folder.id).map(f => (
                <FolderItem key={f.id} folder={f} level={0} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-10 custom-scrollbar bg-white">
      {/* Brand & Context Switch */}
      <div className="mb-14">
        <div className="flex items-center gap-5 mb-12">
          <div className="w-12 h-12 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
            <Library size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">Bibliothèque</h1>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1.5 block">Digital Saurien</span>
          </div>
        </div>
        <div className="bg-slate-50 p-1.5 rounded-[1.5rem] flex items-center gap-1.5 border border-slate-100/50">
          <button 
            onClick={() => {
              setContext('perso');
              onSelectFolder(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeContext === 'perso' 
                ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={14} /> Perso
          </button>
          <button 
            onClick={() => {
              setContext('pro');
              onSelectFolder(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              activeContext === 'pro' 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={14} /> Boulot
          </button>
        </div>
      </div>

      {/* Folders List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <Compass size={14} className="text-slate-300" />
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Explorateur</h3>
          </div>
          <button 
            onClick={() => addFolder("Nouveau dossier", selectedFolderId)}
            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-slate-50 rounded-lg transition-all"
          >
            <FolderPlus size={18} />
          </button>
        </div>
        
        <div className="space-y-2">
          <div 
            onClick={() => onSelectFolder(null)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all ${
              selectedFolderId === null 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Hash size={18} className={selectedFolderId === null ? 'text-blue-400' : 'opacity-30'} />
            <span className={`text-[13px] font-black leading-none ${selectedFolderId === null ? 'text-white' : 'text-slate-700'}`}>Tous les favoris</span>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-50 space-y-2">
            {folders.filter(f => f.parentId === null).map(folder => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-10 px-2 flex items-center justify-between border-t border-slate-50">
        <button className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
          <Settings size={14} /> Préférences
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
