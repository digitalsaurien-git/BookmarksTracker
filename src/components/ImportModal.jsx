import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileJson, CheckCircle2, AlertTriangle, Loader2, Sparkles, Files } from 'lucide-react';

const ImportModal = ({ onClose, onImport }) => {
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
    const rootId = null;
    
    // Improved traverse logic: handles various DL structure nested
    const traverse = (element, parentId) => {
      // Find all children that are DT or DL
      const children = Array.from(element.children);
      
      children.forEach(child => {
        if (child.tagName === 'DT') {
          const h3 = child.querySelector(':scope > h3');
          const a = child.querySelector(':scope > a');
          
          if (h3) {
            // It's a folder
            const folderId = 'folder-import-' + Math.random().toString(36).substr(2, 9);
            folders.push({
              id: folderId,
              name: h3.textContent,
              parentId: parentId,
              isExpanded: false
            });
            
            // Look for the next DL sibling which usually contains the folder content
            const nextDl = child.querySelector(':scope + dl') || child.querySelector(':scope > dl');
            if (nextDl) {
              traverse(nextDl, folderId);
            }
          } else if (a) {
            // It's a bookmark
            bookmarks.push({
              id: 'bookmark-import-' + Math.random().toString(36).substr(2, 9),
              title: a.textContent,
              url: a.getAttribute('href'),
              description: a.getAttribute('note') || a.getAttribute('comment') || '',
              folderId: parentId,
              createdAt: new Date().toISOString()
            });
          }
        } else if (child.tagName === 'DL') {
          traverse(child, parentId);
        }
      });
    };

    // Try finding the first DL
    const topDl = doc.querySelector('dl');
    if (topDl) {
      traverse(topDl, rootId);
    } else {
      // Fallback: search for all <a> tags if DL is missing (sometimes happens in flattened exports)
      const allLinks = doc.querySelectorAll('a');
      if (allLinks.length > 0) {
        allLinks.forEach(a => {
           bookmarks.push({
              id: 'bookmark-flat-' + Math.random().toString(36).substr(2, 9),
              title: a.textContent,
              url: a.getAttribute('href'),
              folderId: rootId,
              createdAt: new Date().toISOString()
           });
        });
      } else {
        throw new Error("Format de fichier non reconnu ou fichier vide.");
      }
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Upload size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Importation</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Favoris Externes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-900 rounded-xl hover:bg-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-10">
          {!stats && !isParsing && (
            <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-16 flex flex-col items-center justify-center space-y-6 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept=".html,.htm" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 shadow-sm transition-colors">
                <Files size={36} />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">Glissez vos favoris ici</p>
                <p className="text-xs text-slate-400 font-medium mt-2">Compatible formats Netscape, Chrome, SiteBar (.html)</p>
              </div>
            </div>
          )}

          {isParsing && (
            <div className="py-20 flex flex-col items-center space-y-6">
              <Loader2 size={48} className="text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Analyse en cours...</p>
            </div>
          )}

          {error && (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-center gap-4 text-rose-600">
              <AlertTriangle size={24} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {stats && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-4xl font-black text-slate-900">{stats.folderCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">Dossiers trouvés</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-4xl font-black text-blue-600">{stats.bookmarkCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-2">Favoris extraits</p>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 text-emerald-700">
                <CheckCircle2 size={24} />
                <p className="text-sm font-bold">Fichier validé. {stats.bookmarkCount} liens vont être ajoutés à votre bibliothèque.</p>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                <Sparkles size={20} />
                Lancer l'importation
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ImportModal;
