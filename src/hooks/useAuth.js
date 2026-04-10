import { useState, useEffect } from 'react';

const AUTH_KEY = 'bookmarks_tracker_auth';
const PASSWORD_HASH_KEY = 'bookmarks_tracker_pwd';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(() => {
    return !!localStorage.getItem(PASSWORD_HASH_KEY);
  });
  const [error, setError] = useState(null);

  // Simple SHA-256 hash using browser native API
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const setPassword = async (newPassword) => {
    try {
      const hash = await hashPassword(newPassword);
      localStorage.setItem(PASSWORD_HASH_KEY, hash);
      setHasPassword(true);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (e) {
      setError("Erreur lors de la configuration du mot de passe.");
      return false;
    }
  };

  const login = async (password) => {
    try {
      const storedHash = localStorage.getItem(PASSWORD_HASH_KEY);
      const inputHash = await hashPassword(password);
      
      if (inputHash === storedHash) {
        setIsAuthenticated(true);
        setError(null);
        return true;
      } else {
        setError("Mot de passe incorrect.");
        return false;
      }
    } catch (e) {
      setError("Erreur lors de la connexion.");
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    hasPassword,
    error,
    login,
    setPassword,
    logout,
    setError
  };
}
