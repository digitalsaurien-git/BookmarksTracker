import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileJson, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react';

const ImportModal = ({ onClose, onImport, context }) => {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const parseNetscapeHTML = (htmlText) => {
    const folders = [];
    const bookmarks = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    
    // Default context roots
    const rootId = `root-${context}`;
    
    const traverse = (element, parentId) => {
      const dtElements = element.querySelectorAll(':scope > dt');
      
      dtElements.forEach(dt => {
        const h3 = dt.querySelector(':scope > h3');
        const a = dt.querySelector(':scope > a');
        
        if (h3) {
          // It's a folder
          const folderId = 'folder-import-' + Math.random().toString(36).substr(2, 9);
          folders.push({
            id: folderId,
            name: h3.textContent,
            parentId: parentId,
            type: context,
            isExpanded: false
          });
          
          const dl = dt.querySelector(':scope + dl');
          if (dl) {
            traverse(dl, folderId);
          }
        } else if (a) {
          // It's a bookmark
          bookmarks.push({
            id: 'bookmark-import-' + Math.random().toString(36).substr(2, 9),
            title: a.textContent,
            url: a.getAttribute('href'),
            description: a.getAttribute('note') || '',
            tags: a.getAttribute('tags') ? a.getAttribute('tags').split(',').map(t => t.trim()) : [],
            folderId: parentId,
            type: context,
            createdAt: new Date().toISOString()
          });
        }
      });
    };

    const topDl = doc.querySelector('dl');
    if (topDl) {
      traverse(topDl, rootId);
    } else {
      throw new Error("Format de fichier non reconnu (balise DL manquante).");
    }

    return { folders, bookmarks };
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setError(null);

    try {
      const text = await selectedFile.text();
      const result = parseNetscapeHTML(text);
      setStats({
        folders: result.folders,
        bookmarks: result.bookmarks,
        folderCount: result.folders.length,
        bookmarkCount: result.bookmarks.length
      });
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    if (stats) {
      onImport(stats.folders, stats.bookmarks);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
              <Upload size={20} />
            </div>
            <h2 className="text-xl font-bold">Importer de SiteBar ({context})</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {!stats && !isParsing && (
            <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-purple-500/50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".html,.htm" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
                <FileJson size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold">Cliquez ou glissez votre export HTML</p>
                <p className="text-xs text-gray-500 mt-1">Format Netscape Bookmarks (SiteBar)</p>
              </div>
            </div>
          )}

          {isParsing && (
            <div className="py-12 flex flex-col items-center space-y-4">
              <Loader2 size={40} className="text-purple-500 animate-spin" />
              <p className="text-sm text-gray-400">Analyse de votre bibliothèque...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
              <AlertTriangle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {stats && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-2xl font-black text-purple-400">{stats.folderCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Dossiers</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-2xl font-black text-blue-400">{stats.bookmarkCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Favoris</p>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400">
                <CheckCircle2 size={20} />
                <p className="text-xs font-medium">Votre fichier est prêt à être importé dans l'espace {context}.</p>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/20 transition-all active:scale-[0.98]"
              >
                <Sparkles size={18} />
                CONFIRMER L'IMPORTATION
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ImportModal;
