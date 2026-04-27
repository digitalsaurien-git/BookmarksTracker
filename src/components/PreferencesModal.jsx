import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Activity, Trash2, Globe, CheckCircle2, AlertTriangle, RefreshCw, Loader2, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PreferencesModal = ({ isOpen, onClose, bookmarks }) => {
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [diagnostics, setDiagnostics] = useState(null);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, title: '' });
  const [selectedDeadIndices, setSelectedDeadIndices] = useState([]);

  useEffect(() => {
    if (isOpen) {
      handleRunDiagnostics();
    }
  }, [isOpen]);

  const handleRunDiagnostics = async () => {
    setDiagnostics(null);
    const results = await bookmarks.runDiagnostics();
    setDiagnostics(results);
  };

  const handleStartScan = async () => {
    setScanProgress({ current: 0, total: 0, title: 'Initialisation...' });
    await bookmarks.scanDeadLinks((curr, tot, title) => {
      setScanProgress({ current: curr, total: tot, title });
    });
  };

  const toggleDeadSelect = (id) => {
    setSelectedDeadIndices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedDeadIndices.length === 0) return;
    if (confirm(`Supprimer ces ${selectedDeadIndices.length} favoris morts définitivement ?`)) {
      bookmarks.bulkDelete(selectedDeadIndices);
      setSelectedDeadIndices([]);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(0,0,0,0.4)] flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Maintenance & Outils</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gérer la santé de votre bibliothèque</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-56 border-r border-slate-50 p-6 flex flex-col gap-2 bg-slate-50/30">
            <button 
              onClick={() => setActiveTab('diagnostics')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'diagnostics' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-white hover:text-slate-600'
              }`}
            >
              <ShieldCheck size={16} /> Diagnostic
            </button>
            <button 
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'scanner' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-white hover:text-slate-600'
              }`}
            >
              <Link2 size={16} /> Liens Morts
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'diagnostics' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">État de la connexion</h3>
                  <button 
                    onClick={handleRunDiagnostics}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    title="Actualiser"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>

                {!diagnostics ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 size={32} className="text-blue-500 animate-spin" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analyse en cours...</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <RefreshCw size={20} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Stockage Cloud</p>
                          <p className="font-bold text-slate-900">Supabase API</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                        diagnostics.supabase.includes('Opérationnel') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {diagnostics.supabase}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Activity size={20} className="text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Stockage Local</p>
                          <p className="font-bold text-slate-900">Browser LocalStorage</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-xl text-[11px] font-black uppercase tracking-wider">
                        {diagnostics.localStorage}
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <CheckCircle2 size={20} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Fichier Git Bridge</p>
                          <p className="font-bold text-slate-900">sync.json Source</p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider ${
                        diagnostics.syncFile === 'Présent' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {diagnostics.syncFile}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'scanner' && (
              <div className="space-y-8 animate-fade-in flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Scanner de liens</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">Vérifier l'accessibilité de vos {bookmarks.allBookmarks.length} favoris</p>
                  </div>
                  {!bookmarks.isScanning && (
                    <button 
                      onClick={handleStartScan}
                      className="btn-primary"
                    >
                      Lancer le scan
                    </button>
                  )}
                </div>

                {bookmarks.isScanning && (
                  <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 text-center space-y-4">
                    <Loader2 size={32} className="text-blue-500 animate-spin mx-auto" />
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Scan en cours ({scanProgress.current} / {scanProgress.total})</p>
                       <p className="font-black text-slate-900 truncate max-w-md mx-auto">{scanProgress.title}</p>
                    </div>
                    <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                )}

                {bookmarks.scanResults && !bookmarks.isScanning && (
                  <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Accessibles</p>
                          <p className="text-3xl font-black text-emerald-600">{bookmarks.scanStats.ok}</p>
                       </div>
                       <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Problèmes</p>
                          <p className="text-3xl font-black text-rose-600">{bookmarks.scanStats.dead + bookmarks.scanStats.suspect}</p>
                       </div>
                    </div>

                    {(bookmarks.scanResults || []).filter(b => b.status !== 'OK').length > 0 && (
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Favoris à traiter</h4>
                          <div className="flex items-center gap-2">
                            {selectedDeadIndices.length > 0 && (
                              <button 
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95"
                              >
                                <Trash2 size={12} /> Supprimer ({selectedDeadIndices.length})
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                const problems = (bookmarks.scanResults || []).filter(b => b.status !== 'OK');
                                if(selectedDeadIndices.length === problems.length) setSelectedDeadIndices([]);
                                else setSelectedDeadIndices(problems.map(d => d.id));
                              }}
                              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900"
                            >
                              {selectedDeadIndices.length === (bookmarks.scanResults || []).filter(b => b.status !== 'OK').length ? 'Tout déselectionner' : 'Tout sélectionner'}
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                           {(bookmarks.scanResults || []).filter(b => b.status !== 'OK').map(b => (
                             <div key={b.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-slate-200 transition-all">
                               <div className="flex items-center gap-4 min-w-0">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedDeadIndices.includes(b.id)}
                                    onChange={() => toggleDeadSelect(b.id)}
                                    className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 shadow-sm"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{b.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <p className="text-[10px] text-slate-400 truncate">{b.url}</p>
                                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${b.status === 'SUSPECT' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                        {b.status}
                                      </span>
                                    </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={b.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg">
                                    <Globe size={14} />
                                  </a>
                                  <button onClick={() => bookmarks.bulkDelete([b.id])} className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                    <Trash2 size={14} />
                                  </button>
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default PreferencesModal;
