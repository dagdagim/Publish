import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'tobiyastudio_user_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [authPrompt, setAuthPrompt] = useState('');
  const pendingCallbackRef = useRef(null);

  // Restore saved session on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.token && session.user) {
          setUser(session.user);
          setToken(session.token);

          // Validate in background with server
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${session.token}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data && data.authenticated && data.user) {
                setUser(data.user);
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                  token: session.token,
                  user: data.user
                }));
              } else {
                // Invalidate if rejected
                setUser(null);
                setToken(null);
                localStorage.removeItem(STORAGE_KEY);
              }
            })
            .catch(() => {
              // On network failure or offline, keep local user state
            });
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAuthModal = useCallback(({ tab = 'login', prompt = '', onAuthSuccess = null } = {}) => {
    setAuthModalTab(tab);
    setAuthPrompt(prompt);
    pendingCallbackRef.current = onAuthSuccess;
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthPrompt('');
    pendingCallbackRef.current = null;
  }, []);

  const handleAuthSuccess = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: userToken, user: userData }));

    // Dispatch global event for other components if needed
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: userData, token: userToken } }));

    // If there was a pending action (e.g., download an app), execute it!
    const cb = pendingCallbackRef.current;
    closeAuthModal();

    if (cb && typeof cb === 'function') {
      setTimeout(() => {
        try {
          cb(userData, userToken);
        } catch (e) {
          console.error('Error running post-auth callback:', e);
        }
      }, 100);
    }
  }, [closeAuthModal]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to sign in.');
    }

    handleAuthSuccess(data.user, data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create account.');
    }

    handleAuthSuccess(data.user, data.token);
    return data;
  };

  const sendOtp = async (email, name = '', password = '', type = 'register') => {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password, type })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send verification code.');
    }
    return data;
  };

  const verifyOtp = async (email, code, extraData = {}) => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, ...extraData })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid or expired verification code.');
    }
    handleAuthSuccess(data.user, data.token);
    return data;
  };

  const loginWithGoogle = async (googleUser) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleUser)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate with Google.');
    }
    handleAuthSuccess(data.user, data.token);
    return data;
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        }).catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user: null, token: null } }));
    }
  };

  /**
   * Helper that executes the given action immediately if user is logged in,
   * or triggers the AuthModal and executes the action automatically once logged in/registered.
   */
  const requireAuth = useCallback((actionCallback, { prompt = 'Please sign in or create an account to continue.', tab = 'register' } = {}) => {
    if (user && token) {
      actionCallback(user, token);
    } else {
      openAuthModal({
        tab,
        prompt,
        onAuthSuccess: (userData, userToken) => actionCallback(userData, userToken)
      });
    }
  }, [user, token, openAuthModal]);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    isAuthModalOpen,
    authModalTab,
    authPrompt,
    setAuthModalTab,
    openAuthModal,
    closeAuthModal,
    requireAuth,
    login,
    register,
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
