import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileJson, AlertCircle, CheckCircle2, RefreshCw, Plus, ArrowRight, Layers, HelpCircle } from 'lucide-react';

const SmartImportModal = ({ isOpen, onClose, bookmarks }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('input'); // input, review, summary
  const [choices, setChoices] = useState([]); // { url, action: 'update' | 'skip' }

  if (!isOpen) return null;

  const handleAnalyze = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const bookmarksToImport = Array.isArray(parsed) ? parsed : (parsed.bookmarks || []);
      
      if (bookmarksToImport.length === 0) {
        throw new Error("Aucun bookmark trouvé dans le JSON.");
      }

      const results = bookmarks.analyzeImport(bookmarksToImport);
      setAnalysis({ results, original: bookmarksToImport });
      setError(null);
      
      if (results.ambiguous.length > 0) {
        setStep('review');
      } else {
        setStep('summary');
      }
    } catch (e) {
      setError("JSON invalide. Assurez-vous d'avoir une liste de bookmarks.");
      setAnalysis(null);
    }
  };

  const toggleChoice = (url, action) => {
    setChoices(prev => {
      const filtered = prev.filter(c => c.url !== url);
      return [...filtered, { url, action }];
    });
  };

  const handleCommit = () => {
    if (!analysis) return;
    bookmarks.commitSmartImport(analysis.original, choices);
    onClose();
    resetState();
    alert("Importation réussie !");
  };

  const resetState = () => {
    setJsonInput('');
    setAnalysis(null);
    setError(null);
    setStep('input');
    setChoices([]);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <RefreshCw size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Import Expert</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Deduplication & Smart Merge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {step === 'input' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Règles métier</h3>
                  <div className="space-y-3">
                    {[
                      "Fusion par dimension (tags)",
                      "Normalisation des URLs",
                      "Détection intelligente d'ambiguïté",
                      "Respect des labels Projet"
                    ].map(t => (
                      <div key={t} className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <CheckCircle2 size={14} className="text-emerald-500" /> {t}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-4">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='Collez votre JSON ici...'
                    className="w-full h-64 bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl p-6 focus:border-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm"
                  />
                  {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{error}</p>}
                </div>
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={!jsonInput.trim()}
                className="w-full h-18 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
              >
                Lancer l'analyse sécurisée
              </button>
            </div>
          )}

          {step === 'review' && analysis && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
                <HelpCircle className="text-amber-500 shrink-0" size={24} />
                <div>
                  <h4 className="text-sm font-black text-amber-900 mb-1">Conflits détectés ({analysis.results.ambiguous.length})</h4>
                  <p className="text-[11px] text-amber-700 font-medium">Les bookmarks suivants existent déjà mais présentent des différences majeures. Choisissez l'action à effectuer.</p>
                </div>
              </div>

              <div className="space-y-6">
                {analysis.results.ambiguous.map((item, idx) => {
                  const choice = choices.find(c => c.url === item.incoming.url)?.action || 'update';
                  return (
                    <div key={idx} className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
                      <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 truncate max-w-md">{item.incoming.url}</span>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200 gap-1">
                          <button 
                            onClick={() => toggleChoice(item.incoming.url, 'update')}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase ${choice === 'update' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                          >Mettre à jour</button>
                          <button 
                            onClick={() => toggleChoice(item.incoming.url, 'skip')}
                            className={`px-3 py-1 rounded-md text-[9px] font-black uppercase ${choice === 'skip' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}
                          >Ignorer</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-100">
                        <div className="p-6 space-y-2 opacity-50">
                          <p className="text-[9px] font-black text-slate-300 uppercase">Actuel</p>
                          <h5 className="text-xs font-black text-slate-900">{item.existing.title}</h5>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{item.existing.description || 'Sans description'}</p>
                        </div>
                        <div className="p-6 space-y-2 bg-indigo-50/20">
                          <p className="text-[9px] font-black text-indigo-400 uppercase">Importé</p>
                          <h5 className="text-xs font-black text-slate-900">{item.incoming.title || item.existing.title}</h5>
                          <p className="text-[10px] text-slate-500 line-clamp-2">{item.incoming.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setStep('summary')}
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
              >
                Continuer vers le résumé final
              </button>
            </div>
          )}

          {step === 'summary' && analysis && (
            <div className="space-y-10 animate-fade-in text-center py-10">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100/50">
                <CheckCircle2 size={48} />
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <h3 className="text-2xl font-black text-slate-900">Analyse terminée</h3>
                <p className="text-slate-500 font-medium">Votre base de données sera synchronisée selon la politique de fusion par dimension.</p>
              </div>

              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-3xl font-black text-indigo-600">{analysis.results.toUpdate + (choices.filter(c => c.action === 'update').length)}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Enrichis</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-3xl font-black text-emerald-600">{analysis.results.toCreate}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Nouveaux</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-300">{choices.filter(c => c.action === 'skip').length}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-2">Ignorés</p>
                </div>
              </div>

              <div className="flex gap-4 max-w-2xl mx-auto pt-10">
                <button 
                  onClick={() => setStep('input')}
                  className="flex-1 h-16 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >Modifier le JSON</button>
                <button 
                  onClick={handleCommit}
                  className="flex-[2] h-16 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
                >Appliquer le plan d'action <ArrowRight size={20} /></button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default SmartImportModal;
