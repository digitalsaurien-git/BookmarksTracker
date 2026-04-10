import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, 
  Library, Hash, Briefcase, User, MoreVertical,
  PlusCircle, FolderPlus
} from 'lucide-react';

const Sidebar = ({ bookmarks, onSelectFolder, selectedFolderId }) => {
  const { folders, activeContext, setContext, addFolder } = bookmarks;

  const handleToggle = (id) => {
    bookmarks.updateFolder(id, { isExpanded: !folders.find(f => f.id === id)?.isExpanded });
  };

  const getSubfolders = (parentId) => {
    return folders.filter(f => f.parentId === parentId && f.type === activeContext);
  };

  const FolderItem = ({ folder, level = 0 }) => {
    const isSelected = selectedFolderId === folder.id;
    const isExpanded = folder.isExpanded;
    const hasChildren = getSubfolders(folder.id).length > 0;

    return (
      <div className="mb-1">
        <div 
          className={`group flex items-center px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            isSelected ? 'bg-blue-50 text-blue-700 shadow-sm' : 'hover:bg-slate-50 text-slate-600'
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
            className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-slate-500 rounded-md transition-colors"
          >
            {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
          </div>
          <div className="flex-1 flex items-center gap-3">
             <div className={`${isSelected ? 'text-blue-500' : 'text-slate-400 opacity-60'}`}>
                {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
             </div>
             <span className={`text-[13px] font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
               {folder.name}
             </span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {getSubfolders(folder.id).map(f => (
                <FolderItem key={f.id} folder={f} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-8 custom-scrollbar">
      {/* Brand & Context Switch */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <Library size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">Bibliothèque</h1>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1 block">Digital Saurien</span>
          </div>
        </div>

        <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-100 shadow-inner">
          <button 
            onClick={() => {
              setContext('perso');
              onSelectFolder('root-perso');
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeContext === 'perso' 
                ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={14} /> Perso
          </button>
          <button 
            onClick={() => {
              setContext('pro');
              onSelectFolder('root-pro');
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeContext === 'pro' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={14} /> Pro
          </button>
        </div>
      </div>

      {/* Folders List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Dossiers</h3>
          <button 
            onClick={() => addFolder("Nouveau dossier", activeContext, `root-${activeContext}`)}
            className="text-slate-300 hover:text-blue-500 transition-colors"
          >
            <FolderPlus size={16} />
          </button>
        </div>
        
        <div className="space-y-1">
          <div 
            onClick={() => onSelectFolder(`root-${activeContext}`)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
              selectedFolderId === `root-${activeContext}` 
                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                : 'hover:bg-slate-50 text-slate-500'
            }`}
          >
            <Hash size={16} className="opacity-40" />
            <span className="text-[13px] font-bold">Tous les favoris</span>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50">
            {folders.filter(f => !f.parentId || f.parentId.startsWith('root-')).filter(f => f.type === activeContext).map(folder => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
