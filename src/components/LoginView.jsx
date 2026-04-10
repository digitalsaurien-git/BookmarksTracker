import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, CheckCircle, AlertCircle, Briefcase, Heart } from 'lucide-react';

const LoginView = ({ auth }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isInitial = !auth.hasPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    auth.setError(null);

    // Artificial delay to make it feel premium/secure
    await new Promise(r => setTimeout(r, 600));

    if (isInitial) {
      if (password !== confirmPassword) {
        auth.setError("Les mots de passe ne correspondent pas.");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 4) {
        auth.setError("Le mot de passe doit faire au moins 4 caractères.");
        setIsSubmitting(false);
        return;
      }
      await auth.setPassword(password);
    } else {
      const success = await auth.login(password);
      if (!success) setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center login-bg p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-card"
      >
        <div className="dots-header">
          <span>::</span> BOOKMARKS TRACKER <span>::</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-pro)] to-[var(--accent-perso)] flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
          >
            {isInitial ? <Shield className="text-white" size={32} /> : <Lock className="text-white" size={32} />}
          </motion.div>
          <h2 className="text-xl font-bold text-center">
            {isInitial ? "Bienvenue !" : "Bon retour parmi nous"}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] text-center mt-1">
            {isInitial 
              ? "Définissons votre mot de passe maître pour sécuriser vos liens." 
              : "Veuillez vous authentifier pour accéder à votre coffre-fort."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {auth.error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle size={16} />
                {auth.error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="login-input-group">
            <label>MOT DE PASSE</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--accent-pro)] transition-colors"
                autoFocus
                required
              />
            </div>
          </div>

          {isInitial && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="login-input-group"
            >
              <label>CONFIRMATION</label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[var(--accent-pro)] transition-colors"
                  required
                />
              </div>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="login-btn group"
          >
            {isSubmitting ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                {isInitial ? "C'EST PARTI" : "ENTRER"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-around">
          <div className="flex flex-col items-center gap-1">
            <Briefcase size={20} className="text-[var(--accent-pro)]" />
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">BOULOT</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart size={20} className="text-[var(--accent-perso)]" />
            <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">PERSO</span>
          </div>
        </div>
      </motion.div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <style jsx>{`
        .shadow-blue-500/20 { box-shadow: 0 10px 15px -3px rgba(56, 139, 253, 0.2); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      `}</style>
    </div>
  );
};

export default LoginView;
