import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Activity, Trash2, Globe, CheckCircle2, 
  AlertTriangle, RefreshCw, Loader2, Link2,
  ExternalLink, CheckSquare, Square, AlertCircle,
  Folder, User, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LinkCheckerModal = ({ isOpen, onClose, bookmarks }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [filter, setFilter] = useState('ALL_PROBLEMS');
  const [hideKept, setHideKept] = useState(true);

  const { isScanning, scanStatus, scanResults, scanStats, scanProgress, scanRestored, scanDeadLinks, stopScan, resetScan, bulkDelete } = bookmarks;

  const hasPartialScan = (scanStatus === 'stopped' || scanStatus === 'error') && scanResults && scanResults.length > 0 && scanStats.analyzed > 0 && scanStats.analyzed < scanStats.total;

  const handleStartScan = async () => {
    if (scanResults && scanResults.length > 0) {
      if (!window.confirm("Les résultats partiels seront effacés. Recommencer depuis zéro ?")) {
        return;
      }
    }
    setSelectedIds([]);
    await scanDeadLinks(false);
  };

  const handleResumeScan = async () => {
    setSelectedIds([]);
    await scanDeadLinks(true);
  };

  const handleReset = () => {
    if (window.confirm("Réinitialiser les résultats de l'analyse ? Cette action supprimera la progression actuelle.")) {
      resetScan();
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredResults = (scanResults || []).filter(item => {
    if (filter === 'KEEP') return item.manualDecision === 'keep';
    if (hideKept && item.manualDecision === 'keep') return false;
    if (filter === 'ALL_PROBLEMS') return item.status === 'MORT_PROBABLE' || item.status === 'SUSPECT';
    if (filter === 'MORT_PROBABLE') return item.status === 'MORT_PROBABLE';
    if (filter === 'SUSPECT') return item.status === 'SUSPECT';
    if (filter === 'OK') return item.status === 'OK';
    return true;
  });

  const selectAllVisible = () => {
    const visibleIds = filteredResults.slice(0, 150).map(item => item.id);
    setSelectedIds(visibleIds);
  };

  const hasSelectedSuspects = (scanResults || []).some(
    item => selectedIds.includes(item.id) && item.status === 'SUSPECT'
  );

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    const count = selectedIds.length;
    const hasFavorite = (scanResults || []).some(item => selectedIds.includes(item.id) && item.isFavorite);
    
    const msg = `Vous allez supprimer ${count} bookmarks. Cette action est définitive.${hasFavorite ? '\nATTENTION : Certains favoris font partie de la sélection.' : ''}\n\nContinuer ?`;
    
    if (window.confirm(msg)) {
      const result = await bulkDelete(selectedIds);
      
      if (result.success) {
        setSelectedIds([]);
        // setScanResults est géré dans le hook useBookmarks
        if (result.ignored > 0) {
          alert(`${result.count} lien(s) supprimé(s).\nCertains liens (${result.ignored}) n'ont pas pu être supprimés car leur identifiant est manquant.`);
        } else {
          alert(`${result.count} lien(s) supprimé(s).`);
        }
      } else {
        alert(`Erreur pendant la suppression : ${result.error || 'Erreur inconnue'}`);
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[400] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh]"
      >
        {/* Header */}
        <div className="px-10 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-200">
              <Link2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contrôle des liens</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                <Activity size={10} className="text-blue-500" /> Analyse de santé
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isScanning ? (
                <button onClick={stopScan} className="flex items-center gap-3 bg-amber-50 text-amber-600 hover:bg-amber-100 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95">
                  <Activity size={14} className="animate-pulse" /> Arrêter
                </button>
             ) : hasPartialScan ? (
                <>
                  <button onClick={handleStartScan} className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95">
                    <RefreshCw size={14} /> Recommencer
                  </button>
                  <button onClick={handleResumeScan} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95">
                    <Play size={14} /> Reprendre
                  </button>
                </>
             ) : (
                <button onClick={handleStartScan} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95">
                  <RefreshCw size={14} /> {scanResults ? 'Relancer' : 'Lancer l\'analyse'}
                </button>
             )}
             <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all">
               <X size={24} />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/30">
          {/* Stats Bar */}
          <div className="px-10 py-3 bg-white border-b border-slate-100 grid grid-cols-5 gap-6">
             <div className="space-y-0.5"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p><p className="text-xl font-black text-slate-900">{scanStats.total}</p></div>
             <div className="space-y-0.5"><p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Analysés</p><p className="text-xl font-black text-blue-600">{scanStats.analyzed}</p></div>
             <div className="space-y-0.5"><p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Valides</p><p className="text-xl font-black text-emerald-600">{scanStats.ok}</p></div>
             <div className="space-y-0.5"><p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Suspects</p><p className="text-xl font-black text-amber-600">{scanStats.suspect}</p></div>
             <div className="space-y-0.5"><p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Morts</p><p className="text-xl font-black text-rose-600">{scanStats.dead}</p></div>
          </div>

          {isScanning && (
            <div className="flex-1 flex flex-col items-center justify-center p-20 space-y-8 animate-pulse">
               <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-500"><Loader2 size={40} className="animate-spin" /></div>
               <div className="text-center space-y-3">
                  <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Analyse en cours...</p>
                  <p className="text-lg font-black text-slate-900 max-w-md truncate">{scanProgress.title}</p>
               </div>
               <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <motion.div initial={{ width: 0 }} animate={{ width: (scanProgress.current / scanProgress.total) * 100 + '%' }} className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{scanProgress.current} sur {scanProgress.total} favoris testés</p>
            </div>
          )}

          {!isScanning && scanResults && (
            <div className="flex-1 flex flex-col min-h-0">
               {hasPartialScan && (
                  <div className="bg-indigo-50 px-10 py-3 border-b border-indigo-100 flex items-start gap-4 text-indigo-700">
                     <AlertCircle size={16} className="mt-0.5" />
                     <p className="text-[10px] font-black uppercase tracking-widest">{scanStats.analyzed} / {scanStats.total} liens déjà analysés. Reprenez ou recommencez.</p>
                  </div>
               )}
               
               {/* Status Header */}
               <div className={`px-10 py-2 flex items-center justify-between border-b ${scanStatus === 'completed' ? 'bg-emerald-50 border-emerald-100' : scanStatus === 'stopped' ? 'bg-amber-50 border-amber-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center ${scanStatus === 'completed' ? 'bg-emerald-500' : scanStatus === 'stopped' ? 'bg-amber-500' : 'bg-rose-500'} text-white`}>
                        {scanStatus === 'completed' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                     </div>
                     <p className="text-[10px] font-black text-slate-900">
                        {scanStatus === 'completed' ? `Analyse terminée` : scanStatus === 'stopped' ? `Analyse interrompue` : `Erreur pendant l'analyse`}
                        <span className="ml-2 text-slate-400 font-medium lowercase italic">({scanStats.analyzed} / {scanStats.total} liens)</span>
                     </p>
                  </div>
                  {scanStatus !== 'idle' && (
                    <button onClick={handleReset} className="text-slate-400 hover:text-rose-500 transition-colors font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                      <Trash2 size={12} /> Réinitialiser
                    </button>
                  )}
               </div>

               {/* Toolbar - Compact Single Row */}
               <div className="px-10 py-2.5 flex items-center justify-between border-b border-slate-100 bg-white/50">
                  <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
                     {[{ id: 'ALL_PROBLEMS', label: 'À vérifier', color: 'text-slate-600' }, { id: 'MORT_PROBABLE', label: 'Morts', color: 'text-rose-600' }, { id: 'SUSPECT', label: 'Suspects', color: 'text-amber-600' }, { id: 'OK', label: 'Valides', color: 'text-emerald-600' }, { id: 'KEEP', label: 'Conservés', color: 'text-blue-600' }].map(btn => (
                       <button key={btn.id} onClick={() => setFilter(btn.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${filter === btn.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : `hover:bg-white/50 ${btn.color}`}`}>
                         {btn.label}
                       </button>
                     ))}
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
                        <button onClick={selectAllVisible} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors shadow-sm">Tout sélectionner ({Math.min(filteredResults.length, 150)})</button>
                        <button onClick={deselectAll} className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Désélectionner</button>
                     </div>
                     {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-3">
                           <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{selectedIds.length} sélectionnés</span>
                           <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-rose-200 active:scale-95"><Trash2 size={12} /> Supprimer</button>
                        </div>
                     ) : (
                        <button onClick={() => setHideKept(!hideKept)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${hideKept ? 'bg-white border-slate-200 text-slate-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                          {hideKept ? 'Masquer conservés' : 'Afficher conservés'}
                        </button>
                     )}
                  </div>
               </div>

               {selectedIds.length > 0 && hasSelectedSuspects && (
                 <div className="px-10 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[9px] font-bold text-amber-700"><AlertTriangle size={12} /><span>Vérifiez les "Suspects" avant suppression.</span></div>
               )}

               {/* Table Header */}
               <div className="px-10 py-2 flex items-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50/50">
                  <div className="w-8" />
                  <div className="flex-1">Titre & URL</div>
                  <div className="w-48">Dossier / Scope</div>
                  <div className="w-40">Statut</div>
                  <div className="w-40 text-right">Actions</div>
               </div>

               {/* Table Content */}
               <div className="flex-1 overflow-y-auto px-10 py-3 space-y-2 custom-scrollbar">
                  {filteredResults.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-10 text-slate-300 space-y-4"><CheckCircle2 size={40} strokeWidth={1} /><p className="text-sm font-bold">Aucun lien</p></div>
                  ) : (
                     <>
                       {filteredResults.slice(0, 150).map(item => (
                         <div key={item.id} className={`p-3 rounded-2xl border transition-all flex items-center gap-4 group ${selectedIds.includes(item.id) ? 'bg-blue-50 border-blue-100 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                           <button onClick={() => toggleSelect(item.id)} className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${selectedIds.includes(item.id) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}>{selectedIds.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button>
                           <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>{item.isFavorite && <span className="text-amber-500 text-[10px]">❤️</span>}</div><p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">{item.url}</p></div>
                           <div className="w-48 flex flex-col gap-0.5"><div className="flex items-center gap-2 text-[10px] font-bold text-slate-500"><Folder size={12} className="text-slate-300" /><span className="truncate">{item.folderName}</span></div><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400"><User size={10} className="text-slate-300" />{item.scope}</div></div>
                           <div className="w-40"><div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'OK' ? 'bg-emerald-100 text-emerald-600' : item.status === 'SUSPECT' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>{item.status === 'OK' ? <CheckCircle2 size={12} /> : item.status === 'SUSPECT' ? <AlertTriangle size={12} /> : <AlertCircle size={12} />}{item.status === 'OK' ? 'Valide' : item.status === 'SUSPECT' ? 'Suspect' : 'Mort'}</div></div>
                           <div className="w-40 flex items-center justify-end gap-2">
                               <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all" title="Vérifier"><ExternalLink size={14} /></a>
                               {item.manualDecision === 'keep' ? (
                                 <button onClick={() => bookmarks.setManualDecision(item.id, null)} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100">Conservé</button>
                               ) : (
                                 <button onClick={() => { bookmarks.setManualDecision(item.id, 'keep'); if (selectedIds.includes(item.id)) { setSelectedIds(prev => prev.filter(id => id !== item.id)); } }} className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">Garder</button>
                               )}
                           </div>
                         </div>
                       ))}
                       {filteredResults.length > 150 && (
                         <div className="p-4 text-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">+ {filteredResults.length - 150} autres</p></div>
                       )}
                     </>
                  )}
               </div>
            </div>
          )}

          {!isScanning && !scanResults && (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8">
               <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-300 shadow-inner"><Link2 size={48} strokeWidth={1} /></div>
               <div className="space-y-3"><h3 className="text-xl font-black text-slate-900">Analyse de la bibliothèque</h3><p className="text-xs text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">Testez vos {bookmarks.allBookmarks.length} favoris pour détecter les liens morts.</p></div>
               <button onClick={handleStartScan} className="flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-200 active:scale-95"><Activity size={18} /> Diagnostic complet</button>
            </div>
          )}
        </div>

        {/* Footer info - Compact */}
        <div className="py-2.5 px-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> VALIDE</p>
              <div className="w-[1px] h-3 bg-slate-200" />
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> SUSPECT</p>
              <div className="w-[1px] h-3 bg-slate-200" />
              <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> MORT</p>
           </div>
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Diagnostic Navigateur • Lots de 10</p>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default LinkCheckerModal;
