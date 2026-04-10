import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, AlertCircle, Sparkles, Mail, Eye, EyeOff } from 'lucide-react';

const LoginView = ({ auth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    auth.setError(null);

    // Premium delay
    await new Promise(r => setTimeout(r, 600));

    let success = false;
    if (isRegistering) {
      success = await auth.signup(email, password);
      if (success) {
        // Automatically switch to login or show success message
        setIsRegistering(false);
        auth.setError("Compte créé ! Veuillez vérifier vos emails ou vous connecter.");
      }
    } else {
      success = await auth.login(email, password);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center login-bg p-4 overflow-hidden bg-[#0d1117]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-card w-full max-w-[400px]"
      >
        <div className="dots-header mb-10">
          <span>::</span> BOOKMARKS TRACKER <span>::</span>
        </div>

        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-white/5"
          >
            <Shield className="text-blue-400" size={32} />
          </motion.div>
          <h2 className="text-2xl font-bold text-center tracking-tight">
            {isRegistering ? "Créer un compte" : "Authentification"}
          </h2>
          <p className="text-xs text-gray-500 text-center mt-2 font-medium uppercase tracking-widest">
            SYNCHRONISATION CLOUD SÉCURISÉE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {auth.error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center gap-3 text-red-400 text-xs overflow-hidden"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{auth.error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="login-input-group">
            <label>IDENTIFIANT (EMAIL)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="email" 
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl focus:border-blue-500/50 transition-all outline-none text-sm"
                autoFocus
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label>MOT DE PASSE</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white/[0.03] border border-white/5 rounded-2xl focus:border-blue-500/50 transition-all outline-none text-sm"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="login-btn group w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                {isRegistering ? "CRÉER MON COMPTE" : "SE CONNECTER"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsRegistering(!isRegistering);
              auth.setError(null);
            }}
            className="text-xs text-gray-500 hover:text-blue-400 transition-colors font-semibold"
          >
            {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Inscrivez-vous"}
          </button>
        </div>
      </motion.div>
      
      {/* Orbes Décoratives - Plus Subtiles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default LoginView;
