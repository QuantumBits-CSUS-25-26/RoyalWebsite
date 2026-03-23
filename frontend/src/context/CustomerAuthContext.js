import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const STORAGE_KEY = 'royalCustomerAuth';

const defaultUser = null;

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUserState] = useState(defaultUser);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setUserState(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setUser = useCallback((next) => {
    setUserState(next);
    if (next) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
      isLoggedIn: Boolean(user?.email),
    }),
    [user, setUser, logout]
  );

  return (
    <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return ctx;
}
