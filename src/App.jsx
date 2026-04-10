import React, { useState } from 'react';
import { useBookmarks } from './hooks/useBookmarks';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AddBookmarkForm from './components/AddBookmarkForm';
import ImportModal from './components/ImportModal';
import LoginView from './components/LoginView';

import { Download, Upload, Plus, LogOut, Search, User, Briefcase, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const auth = useAuth();
  const bookmarks = useBookmarks(auth.user);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState('root-' + (bookmarks.activeContext || 'perso'));

  if (auth.isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <LoginView auth={auth} />;
  }

  const handleExport = () => {
    const blob = new Blob([bookmarks.exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks_tracker_${bookmarks.activeContext}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar 
        bookmarks={bookmarks} 
        onSelectFolder={setSelectedFolderId}
        selectedFolderId={selectedFolderId}
        onAddBookmark={() => setIsAddOpen(true)}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation / Action Bar */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Rechercher par titre, URL ou tag..."
              value={bookmarks.searchQuery}
              onChange={(e) => bookmarks.setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4 ml-6">
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} /> Ajouter
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <button onClick={handleExport} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Exporter">
              <Download size={20} />
            </button>
            <button onClick={() => setIsImportOpen(true)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Importer">
              <Upload size={20} />
            </button>
            <button onClick={auth.logout} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Déconnexion">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-slate-50">
          <MainContent 
            bookmarks={bookmarks} 
            folderId={selectedFolderId}
            onAdd={() => setIsAddOpen(true)}
          />
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
