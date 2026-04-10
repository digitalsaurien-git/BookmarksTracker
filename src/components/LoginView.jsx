import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, Loader2, Bookmark, Info, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 w-full h-full bg-slate-50 flex items-center justify-center overflow-auto p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <main className="w-full max-w-[440px] flex flex-col items-center">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 text-white mb-6">
            <Bookmark size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tighter">BookmarksTracker</h1>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[0.4em]">Digital Saurien Edition</p>
        </div>

        {/* Form Card */}
        <div className="w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-[#0f172a]">
              {isRegistering ? "Créer un accès" : "Connexion"}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-2">
              {isRegistering ? "Rejoignez la plateforme de curation." : "Accédez à votre bibliothèque sécurisée."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {auth.error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-2xl mb-8 text-[11px] font-bold border flex items-center gap-3 ${
                  auth.error.includes('vérifier') 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}
              >
                 {auth.error.includes('vérifier') ? <Info size={16} /> : <AlertTriangle size={16} />}
                 <span className="flex-1">{auth.error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-[#0f172a] font-bold text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-[#0f172a] font-bold text-sm"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-xl shadow-slate-900/10"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isRegistering ? "S'inscrire" : "Se Connecter"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                auth.setError(null);
              }}
              className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors"
            >
              {isRegistering ? "Déjà membre ? Connexion" : "Première fois ? Créer un compte"}
            </button>
          </div>
        </div>

        <p className="text-[10px] font-bold text-slate-300 text-center mt-12 uppercase tracking-[0.5em] opacity-50">
          Cloud Secure &bull; Digital Saurien
        </p>
      </main>
    </div>
  );
};

export default LoginView;
