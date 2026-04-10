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
        <header className="px-8 py-6 flex items-center justify-between border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {bookmarks.activeContext === 'pro' ? 'Espace Professionnel' : 'Espace Personnel'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              {bookmarks.searchQuery ? `Résultats pour "${bookmarks.searchQuery}"` : 'Gestionnaire de ressources'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"
            >
              <Plus size={14} /> Nouveau
            </button>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />

            <button 
              onClick={handleExport}
              title="Exporter JSON"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-slate-300 transition-all"
            >
              <Download size={16} />
            </button>
            
            <button 
              onClick={() => setIsImportOpen(true)}
              title="Importer"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-slate-300 transition-all"
            >
              <Upload size={16} />
            </button>

            <button 
              onClick={auth.logout}
              title="Déconnexion"
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all ml-2"
            >
              <LogOut size={16} />
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

