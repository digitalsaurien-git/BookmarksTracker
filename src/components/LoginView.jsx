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
        auth.setError("Compte créé ! Vous pouvez maintenant vous connecter (vérifiez vos emails pour validation).");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#faf7f2] overflow-hidden">
      {/* Left Column: Visual & Brand (Editorial Library Look) */}
      <div className="hidden lg:flex w-7/12 relative h-full overflow-hidden">
        <motion.div 
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute inset-0 z-0"
        >
          <img 
            src="/brain/51a95abd-e067-48c5-aa28-c77822c69cc0/premium_bookmarks_login_side_1775820814318.png" 
            alt="Library Aesthetic" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-white" />
          <div className="absolute inset-0 bg-[#faf7f2]/10 backdrop-blur-[2px]" />
        </motion.div>

        <div className="relative z-10 w-full p-20 flex flex-col justify-between">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <Bookmark className="text-[#8d6e63]" size={24} />
             </div>
             <span className="text-xl font-black text-white tracking-[0.2em] uppercase drop-shadow-md">Digital Saurien</span>
          </div>

          <div className="max-w-xl">
             <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-black text-white leading-tight drop-shadow-xl mb-6"
             >
                Votre bibliothèque numérique, <br/>
                <span className="text-[#efebe9] italic">parfaitement ordonnée.</span>
             </motion.h2>
             <div className="flex gap-8">
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 text-white/80 font-bold text-xs">
                      <Layers size={14} className="text-[#d7ccc8]" /> HIÉRARCHIE
                   </div>
                   <p className="text-white/60 text-[10px] leading-relaxed max-w-[150px]">Organisation récursive intelligente pour vos centaines de ressources.</p>
                </div>
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-2 text-white/80 font-bold text-xs">
                      <Zap size={14} className="text-[#d7ccc8]" /> CLOUD SYNC
                   </div>
                   <p className="text-white/60 text-[10px] leading-relaxed max-w-[150px]">Accédez à votre catalogue depuis n'importe quel poste de travail.</p>
                </div>
             </div>
          </div>

          <p className="text-white/40 text-[10px] uppercase font-black tracking-widest">Est. 2024 — Digital Saurien Ecosystem</p>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-5/12 h-full flex items-center justify-center p-8 bg-white lg:bg-transparent relative">
        <div className="w-full max-w-md">
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-4xl font-black text-[#5d4037] mb-2 uppercase tracking-tighter">
               {isRegistering ? "Créer un profil" : "Authentification"}
            </h1>
            <p className="text-[10px] font-black text-[#a1887f] uppercase tracking-[0.3em] opacity-60">
               Accès à votre catalogue personnel
            </p>
          </div>

          {auth.error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl mb-8 text-xs font-bold border ${
                auth.error.includes('créé') 
                ? 'bg-green-50 border-green-100 text-green-600' 
                : 'bg-red-50 border-red-100 text-red-500 shadow-sm shadow-red-100'
              }`}
            >
              {auth.error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#5d4037] uppercase tracking-widest pl-1">Identifiant Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a1887f] group-focus-within:text-[#8d6e63] transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-14 pr-6 py-5 bg-[#faf7f2]/80 border-b-2 border-[#d7ccc8]/30 rounded-2xl outline-none focus:border-[#8d6e63] focus:bg-white focus:shadow-xl focus:shadow-[#5d4037]/5 transition-all text-[#5d4037] font-bold placeholder-[#a1887f]/40"
                  placeholder="votre.nom@prestataire.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#5d4037] uppercase tracking-widest pl-1">Code d'accès</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a1887f] group-focus-within:text-[#8d6e63] transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-14 pr-6 py-5 bg-[#faf7f2]/80 border-b-2 border-[#d7ccc8]/30 rounded-2xl outline-none focus:border-[#8d6e63] focus:bg-white focus:shadow-xl focus:shadow-[#5d4037]/5 transition-all text-[#5d4037] font-bold placeholder-[#a1887f]/40"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-6 bg-[#5d4037] text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#5d4037]/20 hover:bg-[#4e342e] transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-10 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isRegistering ? "Initier l'inscription" : "Ouvrir ma bibliothèque"}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <footer className="mt-16 pt-8 border-t border-[#d7ccc8]/30 flex flex-col items-center gap-6">
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                auth.setError(null);
              }}
              className="text-[11px] font-black text-[#8d6e63] hover:text-[#5d4037] transition-all uppercase tracking-widest flex items-center gap-3 group"
            >
              <div className="w-10 h-10 border-2 border-[#d7ccc8]/50 rounded-full flex items-center justify-center group-hover:border-[#8d6e63] transition-all">
                {isRegistering ? <LogIn size={16} /> : <UserPlus size={16} />}
              </div>
              <span>{isRegistering ? "Retour à la connexion" : "Pas de compte ? S'abonner gratuitement"}</span>
            </button>
            <div className="flex items-center gap-2 text-[9px] text-[#a1887f] font-bold uppercase tracking-widest opacity-40">
               <Globe size={12} /> Digital Saurien &copy; 2024
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
