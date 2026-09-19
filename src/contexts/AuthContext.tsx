'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile, logout as authLogout } from '@/lib/firebase/auth';
import { useAppStore } from '@/contexts/StoreContext';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  logout: async () => {},
  refreshProfile: async () => {},
  resendVerification: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastVerificationSent = useRef<number>(0);
  const { hydrateUserStore, resetUserStore } = useAppStore();

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const userProfile = await getUserProfile(uid);
      setProfile(userProfile);
    } catch {
      setError('Failed to load user profile');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          hydrateUserStore(currentUser.uid);
          await fetchProfile(currentUser.uid);
        } else {
          setProfile(null);
          resetUserStore();
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [fetchProfile, hydrateUserStore, resetUserStore]);

  const logout = useCallback(async () => {
    try {
      await authLogout();
      setUser(null);
      setProfile(null);
      resetUserStore();
    } catch {
      setError('Failed to logout');
    }
  }, [resetUserStore]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  }, [user, fetchProfile]);

  const resendVerification = useCallback(async () => {
    if (user && !user.emailVerified) {
      const now = Date.now();
      if (now - lastVerificationSent.current < 60000) {
        throw new Error('Please wait 60 seconds before requesting another verification email.');
      }
      await sendEmailVerification(user);
      lastVerificationSent.current = now;
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, logout, refreshProfile, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
};
