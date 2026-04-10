import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
      }
    );

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
    await supabase.auth.signOut();
  };

  return {
    isAuthenticated,
    user,
    error,
    isLoading,
    login,
    signup,
    logout,
    setError,
    hasPassword: true // Always true for Cloud auth
  };
}
