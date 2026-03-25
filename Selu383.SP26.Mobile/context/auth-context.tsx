import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { authenticationApi, type UserDto } from '@/lib/api';

type AuthContextValue = {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  signIn: (userName: string, password: string) => Promise<void>;
  beginDemoSession: (displayName: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const currentUser = await authenticationApi.me();
      setUser(currentUser ?? null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (userName: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const loggedInUser = await authenticationApi.login({
        userName: userName.trim(),
        password,
      });
      setUser(loggedInUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setErrorMessage(message);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const beginDemoSession = useCallback((displayName: string) => {
    setErrorMessage(null);
    setUser({
      id: -1,
      userName: displayName.trim() || 'guest',
      roles: ['User'],
    });
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authenticationApi.logout();
    } catch {
      // Ignore logout failures and clear local state anyway.
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      errorMessage,
      signIn,
      beginDemoSession,
      signOut,
      refreshSession,
      clearError,
    }),
    [user, isLoading, errorMessage, signIn, beginDemoSession, signOut, refreshSession, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
