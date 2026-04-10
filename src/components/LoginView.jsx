import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, Loader2, Bookmark, Sparkles, Globe, Layers, Zap } from 'lucide-react';

const LoginView = ({ auth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    auth.setError(null);
    
    try {
      const success = isRegistering 
        ? await auth.signup(email, password)
        : await auth.login(email, password);
      
      if (success && isRegistering) {
        setIsRegistering(false);
        auth.setError("Compte créé ! Vous pouvez maintenant vous connecter.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden font-sans">
      {/* Left Column: Visual & Brand */}
      <div className="hidden lg:flex w-7/12 relative h-full overflow-hidden bg-slate-900">
        <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0 z-0"
        >
          <img 
            src="/assets/login-side.png" 
            alt="Library" 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 w-full p-20 flex flex-col justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Bookmark className="text-white" size={20} />
             </div>
             <span className="text-lg font-extrabold text-white tracking-[0.2em] uppercase">Digital Saurien</span>
          </div>

          <div className="max-w-xl">
             <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-extrabold text-white leading-tight mb-8"
             >
                Organisez vos savoirs numérique.
             </motion.h2>
             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                      <Layers size={14} /> Structure
                   </div>
                   <p className="text-slate-400 text-xs leading-relaxed">Arborescence récursive pour une gestion type bibliothèque.</p>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                      <Zap size={14} /> Synchro
                   </div>
                   <p className="text-slate-400 text-xs leading-relaxed">Synchronisation Cloud via Supabase pour tous vos postes.</p>
                </div>
             </div>
          </div>

          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Bookmarks Tracker &copy; 2024</p>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-5/12 h-full flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
               {isRegistering ? "Rejoindre le Cloud" : "Bienvenue"}
            </h1>
            <p className="text-sm font-medium text-slate-500">
               {isRegistering ? "Créez votre compte pour sauvegarder vos favoris." : "Connectez-vous pour accéder à votre bibliothèque."}
            </p>
          </div>

          {auth.error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl mb-8 text-xs font-bold border ${
                auth.error.includes('créé') 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                : 'bg-rose-50 border-rose-100 text-rose-500'
              }`}
            >
              {auth.error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Identifiant</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-semibold text-sm"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest pl-1">Mot de passe</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-900 font-semibold text-sm"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-slate-900/10"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {isRegistering ? "Créer mon compte" : "Se connecter"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 mb-4">
              {isRegistering ? "Déjà membre ?" : "Nouveau ici ?"}
            </p>
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                auth.setError(null);
              }}
              className="px-6 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {isRegistering ? "Se connecter" : "S'inscrire"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
         .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>
    </div>
  );
};

export default LoginView;
