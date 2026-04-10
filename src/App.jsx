import React, { useState } from 'react';
import { useBookmarks } from './hooks/useBookmarks';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AddBookmarkForm from './components/AddBookmarkForm';
import ImportModal from './components/ImportModal';
import LoginView from './components/LoginView';

import { Download, Upload, Plus, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';



function App() {
  const auth = useAuth();
  const bookmarks = useBookmarks(auth.user);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState('root-' + (bookmarks.activeContext || 'perso'));


  if (auth.isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0d1117]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
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

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      bookmarks.importData(data);
    };
    reader.readAsText(file);
  };

  return (
    <div className={`flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] ${bookmarks.activeContext === 'pro' ? 'pro-theme' : 'perso-theme'}`}>
      <Sidebar 
        bookmarks={bookmarks} 
        onSelectFolder={setSelectedFolderId}
        selectedFolderId={selectedFolderId}
        onAddBookmark={() => setIsAddOpen(true)}
      />

      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-8 py-6 flex items-center justify-between border-b border-[var(--border-light)] bg-white/30 backdrop-blur-xl">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
              {bookmarks.activeContext === 'pro' ? 'Espace Professionnel' : 'Espace Personnel'}
            </h2>
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em]">
              {bookmarks.searchQuery ? `Résultats pour "${bookmarks.searchQuery}"` : 'Toutes vos ressources'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[var(--accent-current)] text-white hover:opacity-90 shadow-lg shadow-[var(--accent-current)]/20 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
            >
              <Plus size={18} /> Nouveau Favori
            </button>
            
            <div className="h-8 w-[1px] bg-[var(--border-light)] mx-2" />

            <button 
              onClick={handleExport}
              title="Exporter JSON"
              className="p-3 rounded-2xl bg-white border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
            >
              <Download size={18} />
            </button>
            
            <button 
              onClick={() => setIsImportOpen(true)}
              title="Importer SiteBar / HTML"
              className="p-3 rounded-2xl bg-white border border-[var(--border-light)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all shadow-sm"
            >
              <Upload size={18} />
            </button>

            <button 
              onClick={auth.logout}
              title="Déconnexion"
              className="p-3 rounded-2xl bg-red-50 border border-red-100 text-red-400 hover:bg-red-100 transition-all shadow-sm"
            >
              <LogOut size={18} />
            </button>
          </div>

        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <MainContent 
            bookmarks={bookmarks} 
            folderId={selectedFolderId}
            onAdd={() => setIsAddOpen(true)}
          />
        </div>


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
      </main>
    </div>
  );
}

export default App;

