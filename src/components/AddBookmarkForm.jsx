import React, { useState, useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-bold">Ajouter un favori</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Link2 size={12} className="text-blue-400" /> URL du site
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="Ex: react.dev"
                onBlur={handleUrlBlur}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none transition-all"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Globe size={12} className="text-purple-400" /> Nom du lien
              </label>
              <div className="relative">
                <input
                  required
                  type="text"
                  placeholder={isAutoFetching ? "Récupération..." : "Ex: Doc React"}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 outline-none transition-all"
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
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <AlignLeft size={12} className="text-gray-400" /> Description
            </label>
            <textarea
              placeholder="Petite note sur ce lien..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Folder size={12} className="text-blue-400" /> Dossier
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                value={formData.folderId || ''}
                onChange={e => setFormData({...formData, folderId: e.target.value || null})}
              >
                <option value="" className="bg-[#0d1117]">Bibliothèque (Racine)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id} className="bg-[#0d1117]">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-purple-400" /> Tags
              </label>
              <input
                type="text"
                placeholder="dev, docs, react (séparés par virgules)"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-purple-500 outline-none transition-all"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">Rendre ce lien privé</p>
                <p className="text-[10px] text-gray-500">Masqué lors du partage ou export public</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
              className={`w-12 h-6 rounded-full transition-all relative ${formData.isPrivate ? 'bg-yellow-500' : 'bg-white/10'}`}
            >
              <motion.div 
                animate={{ x: formData.isPrivate ? 26 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-black text-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-[0.98] mt-4"
          >
            ENREGISTRER LE FAVORI
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddBookmarkForm;
