import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const GUEST_MODE_KEY = 'bookmarks_guest_mode';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check guest mode first (offline / local mode)
    const guestMode = localStorage.getItem(GUEST_MODE_KEY) === 'true';
    if (guestMode) {
      setIsGuestMode(true);
      setIsAuthenticated(true);
      setUser(null); // no cloud user in guest mode
      setIsLoading(false);
      return;
    }

    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
      } catch (e) {
        console.warn('Supabase auth check failed (offline?):', e.message);
        // Don't block user - just stay unauthenticated
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    let subscription = { unsubscribe: () => {} };
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
        }
      );
      subscription = data.subscription;
    } catch (e) {
      console.warn('Auth state listener failed:', e.message);
    }

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      // We use email as 'identifiant' for Supabase Auth, 
      // but we can map a username to it or just use email.
      // If the user wants a 'Login', we can assume it's their email.
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return true;
    } catch (e) {
      setError(e.message || "Erreur lors de la connexion.");
      return false;
    }
  };

  const signup = async (email, password) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return true;
    } catch (e) {
      setError(e.message || "Erreur lors de l'inscription.");
      return false;
    }
  };

  const logout = async () => {
    if (isGuestMode) {
      localStorage.removeItem(GUEST_MODE_KEY);
      setIsGuestMode(false);
      setIsAuthenticated(false);
      return;
    }
    await supabase.auth.signOut();
  };

  const enterGuestMode = () => {
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setIsGuestMode(true);
    setIsAuthenticated(true);
    setUser(null);
  };

  return {
    isAuthenticated,
    isGuestMode,
    user,
    error,
    isLoading,
    login,
    signup,
    logout,
    enterGuestMode,
    setError,
    hasPassword: true // Always true for Cloud auth
  };
}
