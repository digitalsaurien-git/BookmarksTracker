import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, 
  Library, Hash, Briefcase, User, MoreVertical,
  PlusCircle, FolderPlus, Compass, Settings, Trash2, Edit2,
  Sparkles, RefreshCw, Github
} from 'lucide-react';

const Sidebar = ({ bookmarks, onSelectFolder, selectedFolderId, onOpenSmartImport }) => {
  const { folders, activeContext, setContext, addFolder, moveFolder, renameFolder } = bookmarks;

  const handleToggle = (id) => {
    bookmarks.toggleFolderExpand(id);
  };

  const getSubfolders = (parentId) => {
    return folders.filter(f => f.parentId === parentId);
  };

  const onDragStart = (e, folderId) => {
    e.dataTransfer.setData("folderId", folderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDrop = (e, targetParentId) => {
    e.preventDefault();
    const draggedFolderId = e.dataTransfer.getData("folderId");
    const draggedBookmarkId = e.dataTransfer.getData("bookmarkId");

    if (draggedFolderId) {
      if (draggedFolderId !== targetParentId) {
        moveFolder(draggedFolderId, targetParentId);
      }
    } else if (draggedBookmarkId) {
      bookmarks.moveBookmark(draggedBookmarkId, targetParentId);
    }
  };

  const FolderItem = ({ folder, level = 0 }) => {
    const isSelected = selectedFolderId === folder.id;
    const isExpanded = folder.isExpanded;
    const hasChildren = getSubfolders(folder.id).length > 0;

    return (
      <div 
        className="mb-2"
        onDragOver={onDragOver}
        onDrop={(e) => {
          e.stopPropagation();
          onDrop(e, folder.id);
        }}
      >
        <div 
          draggable
          onDragStart={(e) => onDragStart(e, folder.id)}
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
          <div className="flex-1 flex items-center justify-between min-w-0 pr-2">
             <div className="flex items-center gap-4 min-w-0">
                <div className={`${folder.color || (isSelected ? 'text-blue-400' : 'text-slate-400 opacity-60')}`}>
                   {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
                </div>
                <span className={`text-[13px] font-black truncate leading-none ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                  {folder.name}
                </span>
             </div>
             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
               {bookmarks.getFolderCounts(folder.id).total}
             </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const newName = window.prompt("Nouveau nom du dossier :", folder.name);
                if (newName && newName !== folder.name) renameFolder(folder.id, newName);
              }}
              className={`p-1.5 rounded-lg transition-all ${
                isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-slate-600'
              }`}
              title="Renommer"
            >
              <Edit2 size={14} />
            </button>
            {!folder.parentId && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addFolder("Nouveau sous-dossier", folder.id);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-blue-50 text-slate-300 hover:text-blue-500'
                }`}
                title="Nouveau sous-dossier"
              >
                <FolderPlus size={14} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Supprimer le dossier "${folder.name}" et tout son contenu ?`)) {
                  bookmarks.deleteFolder(folder.id);
                }
              }}
              className={`p-1.5 rounded-lg transition-all ${
                isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-50 text-slate-300 hover:text-rose-500'
              }`}
              title="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </div>
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
    <div className="flex-1 flex flex-col p-10 overflow-y-auto custom-scrollbar bg-white">
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
            <User size={14} /> Perso ({bookmarks.getContextCount('perso')})
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
            <Briefcase size={14} /> Boulot ({bookmarks.getContextCount('pro')})
          </button>
        </div>
      </div>

      {/* Smart Views */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Hash size={14} className="text-slate-400" />
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Vues Intelligentes</h3>
        </div>
        
        <div className="space-y-2">
          <div 
            onClick={() => {
              bookmarks.setActiveFilter('all');
              bookmarks.setSearchQuery('');
              onSelectFolder(null);
            }}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${
              bookmarks.activeFilter === 'all' && selectedFolderId === null && !bookmarks.searchQuery
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Library size={18} className={bookmarks.activeFilter === 'all' && selectedFolderId === null && !bookmarks.searchQuery ? 'text-blue-400' : 'opacity-30'} />
            <span className={`text-[13px] font-black leading-none`}>Bibliothèque</span>
          </div>

          <div 
            onClick={() => {
              bookmarks.setActiveFilter('favorites');
              onSelectFolder(null);
            }}
            className={`flex items-center justify-between px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${
              bookmarks.activeFilter === 'favorites' 
                ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <Sparkles size={18} fill={bookmarks.activeFilter === 'favorites' ? "currentColor" : "none"} className={bookmarks.activeFilter === 'favorites' ? 'text-white' : 'text-amber-500'} />
              <span className={`text-[13px] font-black leading-none`}>Favoris (Coup de ❤️)</span>
            </div>
          </div>

          <div 
            onClick={() => {
              bookmarks.setActiveFilter('daily');
              onSelectFolder(null);
            }}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${
              bookmarks.activeFilter === 'daily' 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Compass size={18} className={bookmarks.activeFilter === 'daily' ? 'text-white' : 'text-blue-500'} />
            <span className={`text-[13px] font-black leading-none`}>Usage Quotidien</span>
          </div>

          <div 
            onClick={() => {
              bookmarks.setActiveFilter('popular');
              onSelectFolder(null);
            }}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl cursor-pointer transition-all ${
              bookmarks.activeFilter === 'popular' 
                ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/20' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Sparkles size={18} className={bookmarks.activeFilter === 'popular' ? 'text-white' : 'text-rose-500'} />
            <span className={`text-[13px] font-black leading-none`}>Top 10 (Popularité)</span>
          </div>
        </div>
      </div>

      {/* Toolbox & Projects Sections */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Briefcase size={14} className="text-indigo-500" />
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Mes Projets</h3>
        </div>
        <div className="flex flex-wrap gap-2 px-2 mb-10">
          {bookmarks.projects.map(projectTag => {
            const projectName = projectTag.split(':')[1];
            const isActive = bookmarks.searchQuery === projectTag;
            return (
              <button
                key={projectTag}
                onClick={() => {
                  bookmarks.setSearchQuery(isActive ? '' : projectTag);
                  bookmarks.setActiveFilter('all');
                  onSelectFolder(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200' 
                    : 'bg-indigo-50 text-indigo-500 border-indigo-100 hover:bg-slate-100'
                }`}
              >
                {projectName}
              </button>
            );
          })}
          {bookmarks.projects.length === 0 && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1 italic">Aucun projet tagué</p>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8 px-2">
          <Settings size={14} className="text-purple-500" />
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Boîte à outils</h3>
        </div>
        <div className="flex flex-wrap gap-2 px-2">
          {[...new Set(
            bookmarks.allBookmarks
              .filter(b => b.type === bookmarks.activeContext)
              .flatMap(b => Array.isArray(b.tags) ? b.tags : [])
              .filter(t => t.startsWith('tool:'))
          )].map(toolTag => {
            const toolName = toolTag.split(':')[1];
            const isActive = bookmarks.searchQuery === toolTag;
            return (
              <button
                key={toolTag}
                onClick={() => {
                  bookmarks.setSearchQuery(isActive ? '' : toolTag);
                  bookmarks.setActiveFilter('all');
                  onSelectFolder(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
                  isActive 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {toolName}
              </button>
            );
          })}
          {[...new Set(
            bookmarks.allBookmarks
              .filter(b => b.type === bookmarks.activeContext)
              .flatMap(b => Array.isArray(b.tags) ? b.tags : [])
              .filter(t => t.startsWith('tool:'))
          )].length === 0 && (
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1 italic">Aucun outil tagué</p>
          )}
        </div>
      </div>

      {/* Folders List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <Library size={14} className="text-slate-300" />
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
          <div className="mt-2 space-y-2">
            {folders.filter(f => f.parentId === null).map(folder => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 px-2 space-y-4 border-t border-slate-50">
        <button 
          onClick={onOpenSmartImport}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all group"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Import Intelligent
        </button>
        <button 
          onClick={() => bookmarks.forceSyncFromFile()}
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all group shadow-lg shadow-slate-200"
          title="Charger les favoris depuis le repo Git (sync.json)"
        >
          <Github size={14} className="group-hover:scale-110 transition-all" /> Sync via GitHub
        </button>
        <div className="flex items-center justify-between opacity-50 hover:opacity-100 transition-opacity">
          <button className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            <Settings size={14} /> Préférences
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
