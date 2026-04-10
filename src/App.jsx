import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import SearchBar from './components/SearchBar';
import AddBookmarkForm from './components/AddBookmarkForm';
import ImportModal from './components/ImportModal';
import LoginView from './components/LoginView';
import { useBookmarks } from './hooks/useBookmarks';
import { useAuth } from './hooks/useAuth';
import { Plus, Download, Upload, LogOut, Settings, UserCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const auth = useAuth();
  const bookmarks = useBookmarks(auth.user?.id);
  const [selectedFolderId, setSelectedFolderId] = useState(`root-${bookmarks.activeContext}`);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  if (auth.isLoading) return null;
  if (!auth.isAuthenticated) return <LoginView auth={auth} />;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
      {/* Sidebar - Wide and Premium */}
      <aside className="w-[340px] h-full flex-shrink-0 bg-white border-r border-slate-100 flex flex-col shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        <Sidebar 
          bookmarks={bookmarks} 
          onSelectFolder={setSelectedFolderId}
          selectedFolderId={selectedFolderId}
        />
        
        {/* User Profile / Logout */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-tight">{auth.user?.email}</p>
              <button 
                onClick={auth.logout}
                className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1.5 mt-1 transition-colors"
              >
                <LogOut size={12} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container - Centered and Spacious */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[1200px] mx-auto px-12 md:px-20 py-16">
          
          {/* Top Integrated Search & Actions */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
            <div className="w-full md:max-w-xl">
              <SearchBar value={bookmarks.searchQuery} onChange={bookmarks.setSearchQuery} />
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsImportOpen(true)}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                title="Importer des favoris"
              >
                <Upload size={20} />
              </button>
              <button 
                onClick={() => bookmarks.exportToHTML()}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                title="Exporter mes favoris"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-2.5 bg-blue-600 px-8 py-3.5 rounded-2xl text-white font-bold text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 transition-all active:scale-95 ml-2"
              >
                <Plus size={18} /> Nouveau
              </button>
            </div>
          </div>

          {/* Current Selection & Content */}
          <MainContent 
            bookmarks={bookmarks} 
            folderId={selectedFolderId}
            onAdd={() => setIsAddOpen(true)}
          />
        </div>

        {/* Modals with AnimatePresence */}
        <AnimatePresence>
          {isAddOpen && (
            <AddBookmarkForm 
              onClose={() => setIsAddOpen(false)}
              onSubmit={(data) => {
                bookmarks.addBookmark({ ...data, folderId: selectedFolderId });
                setIsAddOpen(false);
              }}
              folders={bookmarks.folders}
              defaultFolderId={selectedFolderId}
            />
          )}
          {isImportOpen && (
            <ImportModal 
              context={bookmarks.activeContext}
              onClose={() => setIsImportOpen(false)}
              onImport={bookmarks.bulkImport}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
