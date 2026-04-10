import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, Loader2, Bookmark, Info, AlertTriangle, ShieldCheck } from 'lucide-react';

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
        auth.setError("Veuillez vérifier votre boîte mail pour confirmer votre inscription.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full mesh-gradient flex items-center justify-center overflow-auto p-6 font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-20 right-[15%] w-64 h-64 bg-blue-400/10 blur-3xl rounded-full animate-pulse" />
      <div className="absolute bottom-20 left-[15%] w-96 h-96 bg-indigo-400/10 blur-3xl rounded-full animate-pulse delay-700" />

      <main className="w-full max-w-[480px] relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-slate-900/20 text-white mb-6 animate-float">
            <Bookmark size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">BookmarksTracker</h1>
          <div className="flex items-center gap-3 mt-4">
             <div className="h-[1px] w-8 bg-slate-200" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Digital Saurien Edition</p>
             <div className="h-[1px] w-8 bg-slate-200" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="premium-glass rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group"
        >
          {/* Subtle Glow interaction */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500" />

          <div className="mb-12">
            <h2 className="text-2xl font-black text-slate-900">
              {isRegistering ? "Créer un accès" : "Bienvenue"}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-2">
              {isRegistering ? "Commencez votre curation privée." : "Connectez-vous à votre espace personnel."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {auth.error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-5 rounded-2xl mb-10 overflow-hidden border flex items-center gap-4 ${
                  auth.error.includes('vérifier') 
                  ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50/50 border-rose-100 text-rose-600'
                }`}
              >
                 <div className="p-2 bg-white rounded-xl shadow-sm">
                   {auth.error.includes('vérifier') ? <Info size={18} /> : <AlertTriangle size={18} />}
                 </div>
                 <span className="text-xs font-bold leading-tight flex-1">{auth.error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8 stagger-in">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 btn-primary mt-6 text-sm glow-btn group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <span className="font-black">{isRegistering ? "CRÉER MON COMPTE" : "SE CONNECTER"}</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                auth.setError(null);
              }}
              className="text-xs font-black text-slate-900 uppercase tracking-[0.15em] hover:text-blue-600 transition-all flex items-center gap-2"
            >
              {isRegistering ? "Déjà membre ?" : "Nouveau ici ?"}
              <span className="text-blue-600 underline underline-offset-4 font-black">
                {isRegistering ? "Me connecter" : "Créer un accès"}
              </span>
            </button>
          </div>
        </motion.div>

        <div className="flex items-center justify-center gap-6 mt-16 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] opacity-80 stagger-in">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-400" />
            <span>Chiffrement AES-256</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <span>Synchronisation Cloud</span>
        </div>
      </main>
    </div>
  );
};

export default LoginView;
