import React, { useState } from 'react';
import { X, Globe, Link2, Tag, Folder } from 'lucide-react';
import { motion } from 'framer-motion';

const AddBookmarkForm = ({ onClose, onSubmit, folders, defaultFolderId }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    tags: '',
    folderId: defaultFolderId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;
    
    // Add protocol if missing
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
        className="glass w-full max-w-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Ajouter un Bookmark</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Globe size={14} className="text-[var(--accent-current)]" /> Titre du site
            </label>
            <input
              autoFocus
              required
              type="text"
              placeholder="Ex: Documentation React"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-[var(--accent-current)] outline-none"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Link2 size={14} className="text-[var(--accent-current)]" /> URL
            </label>
            <input
              required
              type="text"
              placeholder="Ex: react.dev"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-[var(--accent-current)] outline-none"
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Folder size={14} className="text-[var(--accent-current)]" /> Dossier
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-[var(--accent-current)] outline-none appearance-none"
                value={formData.folderId}
                onChange={e => setFormData({...formData, folderId: e.target.value})}
              >
                {folders.map(f => (
                  <option key={f.id} value={f.id} className="bg-[#1c2128]">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} className="text-[var(--accent-current)]" /> Tags (séparés par virgules)
              </label>
              <input
                type="text"
                placeholder="Ex: dev, docs, react"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-[var(--accent-current)] outline-none"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[var(--accent-current)] text-white rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(var(--accent-current-rgb),0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sauvegarder
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddBookmarkForm;
