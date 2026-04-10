import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, ArrowRight, Loader2, Bookmark, Sparkles } from 'lucide-react';

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
    <div className="h-screen w-full flex items-center justify-center bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#efebe9] rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d7ccc8] rounded-full blur-[120px] opacity-30" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-white rounded-[40px] shadow-2xl shadow-[#5d4037]/10 border border-[#d7ccc8]/30 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-[#efebe9] rounded-3xl mb-6 shadow-inner"
          >
            <Bookmark size={40} className="text-[#8d6e63]" />
          </motion.div>
          <h1 className="text-4xl font-black text-[#5d4037] tracking-tight mb-2 uppercase">Bookmarks</h1>
          <p className="text-xs font-black text-[#a1887f] uppercase tracking-[0.3em] opacity-60">Digital Saurien Cloud</p>
        </div>

        {auth.error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl mb-6 text-xs font-bold border ${
              auth.error.includes('créé') 
              ? 'bg-green-50 border-green-100 text-green-600' 
              : 'bg-red-50 border-red-100 text-red-500'
            }`}
          >
            {auth.error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 px-1">
            <label className="text-[10px] font-black text-[#a1887f] uppercase tracking-widest pl-1">Adresse Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1887f] group-focus-within:text-[#8d6e63] transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#faf7f2] border border-[#d7ccc8]/50 rounded-2xl outline-none focus:border-[#8d6e63] focus:ring-4 focus:ring-[#8d6e63]/5 transition-all text-[#5d4037] font-semibold"
                placeholder="nom@exemple.com"
              />
            </div>
          </div>

          <div className="space-y-1.5 px-1">
            <label className="text-[10px] font-black text-[#a1887f] uppercase tracking-widest pl-1">Mot de passe</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1887f] group-focus-within:text-[#8d6e63] transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-[#faf7f2] border border-[#d7ccc8]/50 rounded-2xl outline-none focus:border-[#8d6e63] focus:ring-4 focus:ring-[#8d6e63]/5 transition-all text-[#5d4037] font-semibold"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-gradient-to-br from-[#8d6e63] to-[#5d4037] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#5d4037]/20 hover:opacity-90 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isRegistering ? 'Créer mon compte' : 'Me connecter'}
                <Sparkles size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              auth.setError(null);
            }}
            className="text-[10px] font-black text-[#a1887f] hover:text-[#8d6e63] transition-colors uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
          >
            {isRegistering ? "Déjà un compte ? Connexion" : "Pas encore de compte ? Inscription"}
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
