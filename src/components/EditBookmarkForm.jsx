import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Link2, Tag, Folder, AlignLeft, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const TAG_CATEGORIES = {
  tool: { label: 'Outil', options: ['Make', 'Notion', 'OpenAI', 'Airtable', 'Power Automate', 'Zapier', 'Stitch', 'Google Cloud', 'AWS'] },
  usage: { label: 'Usage', options: ['Quotidien', 'Occasio', 'Rare'] },
  status: { label: 'Statut', options: ['Actif', 'Test', 'À voir', 'Archive'] },
  prio: { label: 'Priorité', options: ['Urgent', 'Important', 'Normal', 'Faible'] },
  type: { label: 'Type', options: ['Outil', 'Doc', 'Tutoriel', 'Article', 'Video', 'Formation', 'Recette', 'Service', 'Ressource'] }
};

const EditBookmarkForm = ({ bookmark, onClose, onSubmit, folders }) => {
  const parseExistingTags = () => {
    const tags = Array.isArray(bookmark.tags) ? bookmark.tags : [];
    const categoryValues = { tool: '', usage: '', status: '' };
    const otherTags = [];

    tags.forEach(tag => {
      const [key, val] = tag.split(':');
      if (key && val && categoryValues[key] !== undefined) {
        // Find matching option (case insensitive)
        const option = TAG_CATEGORIES[key].options.find(opt => opt.toLowerCase() === val.toLowerCase());
        if (option) categoryValues[key] = option;
        else otherTags.push(tag);
      } else {
        otherTags.push(tag);
      }
    });

    return { categoryValues, otherTags: otherTags.join(', ') };
  };

  const initialParsed = parseExistingTags();

  const [formData, setFormData] = useState({
    title: bookmark.title || '',
    url: bookmark.url || '',
    folderId: bookmark.folderId || '',
    description: bookmark.description || '',
    faviconUrl: bookmark.faviconUrl || '',
    isPrivate: !!bookmark.isPrivate,
    isFavorite: !!bookmark.isFavorite,
    categoryValues: initialParsed.categoryValues,
    project: initialParsed.project, // Separated project field
    otherTags: initialParsed.otherTags
  });

  const [isAutoFetching, setIsAutoFetching] = useState(false);

  const handleUrlBlur = () => {
    if (formData.url && !formData.title) {
      setIsAutoFetching(true);
      setTimeout(() => {
        const domain = formData.url.replace(/https?:\/\//i, '').split('/')[0];
        setFormData(prev => ({
          ...prev,
          faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          title: prev.title || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
        }));
        setIsAutoFetching(false);
      }, 800);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    
    let url = formData.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    // Combine guided tags and other tags
    const structuredTags = Object.entries(formData.categoryValues)
      .filter(([_, val]) => val)
      .map(([cat, val]) => `${cat}:${val.toLowerCase()}`);
    
    if (formData.project) {
      structuredTags.push(`projet:${formData.project}`);
    }
    
    const manualTags = formData.otherTags.split(',').map(t => t.trim()).filter(Boolean);
    const finalTags = [...new Set([...structuredTags, ...manualTags.map(t => t.toLowerCase())])];

    onSubmit({ ...formData, url, tags: finalTags });
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] my-auto"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Modifier le favori</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Link2 size={12} className="text-blue-500" /> URL du site
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="Ex: react.dev"
                onBlur={handleUrlBlur}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-blue-500 focus:bg-white outline-none transition-all placeholder-slate-400 font-medium"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} className="text-purple-500" /> Nom du lien
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder={isAutoFetching ? "Récupération..." : "Ex: Doc React"}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-purple-500 focus:bg-white outline-none transition-all placeholder-slate-400 font-medium"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={12} className="text-slate-400" /> Description / Notes
            </label>
            <textarea
              placeholder="Notes personnelles sur ce lien..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none placeholder-slate-400 font-medium"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Folder size={12} className="text-blue-500" /> Dossier
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-blue-500 focus:bg-white outline-none cursor-pointer font-medium"
                value={formData.folderId || ''}
                onChange={e => setFormData({...formData, folderId: e.target.value || null})}
              >
                <option value="" className="bg-white text-slate-900 font-medium">Bibliothèque (Racine)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id} className="bg-white text-slate-900 font-medium">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-purple-500" /> Catégorisation Intelligente
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(TAG_CATEGORIES).map(([key, cat]) => (
                  <div key={key} className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-1">{cat.label}</p>
                    <select
                      value={formData.categoryValues[key]}
                      onChange={(e) => setFormData({
                        ...formData, 
                        categoryValues: { ...formData.categoryValues, [key]: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-purple-500 transition-all cursor-pointer"
                    >
                      <option value="">Aucun</option>
                      {cat.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 mt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-1">Projet</p>
                <input
                  type="text"
                  placeholder="Ex: ARCS, API, RH..."
                  list="project-suggestions"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-purple-500 focus:bg-white outline-none transition-all placeholder-slate-400 font-bold text-sm"
                  value={formData.project}
                  onChange={e => setFormData({...formData, project: e.target.value})}
                />
                <datalist id="project-suggestions">
                   {[...new Set(folders.flatMap(f => []) /* Actually should fetch from bookmarks tags */)].map(p => <option key={p} value={p} />)}
                </datalist>
              </div>

              <div className="space-y-1.5 mt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter ml-1">Autres Tags (libres)</p>
                <input
                  type="text"
                  placeholder="prio:1, perso, r&d..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-purple-500 focus:bg-white outline-none transition-all placeholder-slate-400 font-medium text-sm"
                  value={formData.otherTags}
                  onChange={e => setFormData({...formData, otherTags: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${formData.isFavorite ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Sparkles size={18} fill={formData.isFavorite ? "currentColor" : "none"} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Coup de ❤️</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Accès rapide favoris</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isFavorite: !formData.isFavorite})}
                className={`w-10 h-5 rounded-full transition-all relative ${formData.isFavorite ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <motion.div 
                  animate={{ x: formData.isFavorite ? 22 : 2 }}
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${formData.isPrivate ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Privé</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Masqué si partagé</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
                className={`w-10 h-5 rounded-full transition-all relative ${formData.isPrivate ? 'bg-indigo-500' : 'bg-slate-300'}`}
              >
                <motion.div 
                  animate={{ x: formData.isPrivate ? 22 : 2 }}
                  className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-slate-900 text-white rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default EditBookmarkForm;
