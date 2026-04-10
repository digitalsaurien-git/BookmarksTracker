import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import SearchBar from './components/SearchBar';
import AddBookmarkForm from './components/AddBookmarkForm';
import ImportModal from './components/ImportModal';
import LoginView from './components/LoginView';
import { useBookmarks } from './hooks/useBookmarks';
import { useAuth } from './hooks/useAuth';
import { Plus, Download, Upload, LogOut, UserCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const auth = useAuth();
  const bookmarks = useBookmarks(auth.user?.id);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  if (auth.isLoading) return null;
  if (!auth.isAuthenticated) return <LoginView auth={auth} />;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 overflow-hidden relative">
      {/* Decorative background elements for "Design" feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar - Wide and Premium */}
      <aside className="w-[420px] h-full flex-shrink-0 bg-white border-r border-slate-100 flex flex-col z-10">
        <Sidebar 
          bookmarks={bookmarks} 
          onSelectFolder={setSelectedFolderId}
          selectedFolderId={selectedFolderId}
        />
        
        {/* User Profile / Logout */}
        <div className="p-8 border-t border-slate-50 bg-slate-50/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold truncate leading-tight">{auth.user?.email}</p>
              <button 
                onClick={auth.logout}
                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1.5 mt-1 transition-colors"
              >
                <LogOut size={12} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-[1400px] mx-auto px-12 md:px-24 py-20">
          
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-24 gap-12">
            <div className="w-full md:max-w-2xl translate-y-0 hover:-translate-y-1 transition-transform duration-300">
              <SearchBar value={bookmarks.searchQuery} onChange={bookmarks.setSearchQuery} />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                <button 
                  onClick={() => setIsImportOpen(true)}
                  className="p-3.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
                  title="Importer des favoris"
                >
                  <Upload size={20} />
                </button>
                <div className="w-[1px] bg-slate-100 my-2 mx-1" />
                <button 
                  onClick={() => bookmarks.exportToHTML()}
                  className="p-3.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all active:scale-95"
                  title="Exporter mes favoris"
                >
                  <Download size={20} />
                </button>
              </div>
              
              <button 
                onClick={() => setIsAddOpen(true)}
                className="btn-primary flex items-center gap-3 px-10"
              >
                <Plus size={18} strokeWidth={3} /> Nouveau
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="animate-fade-in">
            <MainContent 
              bookmarks={bookmarks} 
              folderId={selectedFolderId}
              onAdd={() => setIsAddOpen(true)}
            />
          </div>
        </div>

        {/* Modals */}
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
