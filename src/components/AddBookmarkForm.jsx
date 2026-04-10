import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Link2, Tag, Folder, AlignLeft, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const AddBookmarkForm = ({ onClose, onSubmit, folders, defaultFolderId }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    tags: '',
    folderId: defaultFolderId || '',
    description: '',
    faviconUrl: '',
    isPrivate: false
  });

  const [isAutoFetching, setIsAutoFetching] = useState(false);

  // Simple auto-fetch favicon and title simulation
  const handleUrlBlur = () => {
    if (formData.url && !formData.title) {
      setIsAutoFetching(true);
      // In a real app, we'd fetch this from a metadata API
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
    
    onSubmit({ ...formData, url });
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Ajouter un favori</h2>
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
                {isAutoFetching && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={12} className="text-slate-400" /> Description
            </label>
            <textarea
              placeholder="Petite note sur ce lien..."
              rows={3}
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-purple-500" /> Tags
              </label>
              <input
                type="text"
                placeholder="dev, docs, react (séparés par virgules)"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 focus:border-purple-500 focus:bg-white outline-none transition-all placeholder-slate-400 font-medium"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Rendre ce lien privé</p>
                <p className="text-[10px] text-slate-500 font-medium">Masqué lors du partage ou export public</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
              className={`w-12 h-6 rounded-full transition-all relative ${formData.isPrivate ? 'bg-yellow-500' : 'bg-slate-300'}`}
            >
              <motion.div 
                animate={{ x: formData.isPrivate ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow border-slate-100"
              />
            </button>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[13px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.98] mt-4"
          >
            Enregistrer le favori
          </button>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default AddBookmarkForm;
