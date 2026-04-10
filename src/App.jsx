import React, { useState } from 'react';
import { useBookmarks } from './hooks/useBookmarks';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import SearchBar from './components/SearchBar';
import AddBookmarkForm from './components/AddBookmarkForm';
import { Download, Upload, Plus } from 'lucide-react';

function App() {
  const bookmarks = useBookmarks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState('root-' + bookmarks.activeContext);

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
    <div className={`flex h-screen bg-[#0d1117] text-white ${bookmarks.activeContext === 'pro' ? 'pro-theme' : 'perso-theme'}`}>
      <Sidebar 
        bookmarks={bookmarks} 
        onSelectFolder={setSelectedFolderId}
        selectedFolderId={selectedFolderId}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-6 flex items-center justify-between glass border-b border-white/5">
          <div className="flex-1 max-w-2xl">
            <SearchBar value={bookmarks.searchQuery} onChange={bookmarks.setSearchQuery} />
          </div>
          
          <div className="flex items-center gap-3 ml-4">
            <button 
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-lg bg-[var(--accent-current)] hover:opacity-90 flex items-center gap-2 font-medium"
            >
              <Plus size={18} /> Ajouter
            </button>
            
            <button 
              onClick={handleExport}
              title="Exporter JSON"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Download size={18} />
            </button>
            
            <label className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer">
              <Upload size={18} />
              <input type="file" hidden onChange={handleImport} accept=".json" />
            </label>
          </div>
        </header>

        <MainContent 
          bookmarks={bookmarks} 
          folderId={selectedFolderId}
          onAdd={() => setIsAddOpen(true)}
        />

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
      </main>
      
      <style jsx>{`
        .flex { display: flex; }
        .h-screen { height: 100vh; }
        .flex-1 { flex: 1; }
        .flex-col { flex-direction: column; }
        .overflow-hidden { overflow: hidden; }
        .relative { position: relative; }
        .p-6 { padding: 1.5rem; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .max-w-2xl { max-width: 42rem; }
        .ml-4 { margin-left: 1rem; }
        .gap-3 { gap: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .font-medium { font-weight: 500; }
        .p-2 { padding: 0.5rem; }
        .border-b { border-bottom-width: 1px; }
        .cursor-pointer { cursor: pointer; }
        .border { border-width: 1px; }
        .hidden { display: none; }
      `}</style>
    </div>
  );
}

export default App;
