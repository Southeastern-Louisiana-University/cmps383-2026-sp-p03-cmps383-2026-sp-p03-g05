import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { authenticationApi, ordersApi, usersApi, type CreateOrderDto, type UserDto } from '@/lib/api';

type AuthContextValue = {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  pendingGuestRewardPoints: number;
  signIn: (userName: string, password: string) => Promise<UserDto>;
  beginDemoSession: (displayName: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  queuePendingGuestCheckout: (input: { rewardPoints: number; orderDraft?: CreateOrderDto | null }) => void;
  clearPendingGuestCheckout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingGuestRewardPoints, setPendingGuestRewardPoints] = useState(0);
  const [pendingGuestOrderDrafts, setPendingGuestOrderDrafts] = useState<CreateOrderDto[]>([]);

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

  const queuePendingGuestCheckout = useCallback((input: { rewardPoints: number; orderDraft?: CreateOrderDto | null }) => {
    const normalizedPoints = Math.max(0, Math.round(input.rewardPoints));
    if (normalizedPoints > 0) {
      setPendingGuestRewardPoints((current) => current + normalizedPoints);
    }

    if (input.orderDraft) {
      setPendingGuestOrderDrafts((current) => [...current, input.orderDraft]);
    }
  }, []);

  const clearPendingGuestCheckout = useCallback(() => {
    setPendingGuestRewardPoints(0);
    setPendingGuestOrderDrafts([]);
  }, []);

  const signIn = useCallback(
    async (userName: string, password: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const loggedInUser = await authenticationApi.login({
          userName: userName.trim(),
          password,
        });
        setUser(loggedInUser);

        const pendingPointsToClaim = pendingGuestRewardPoints;
        const pendingOrdersToReplay = pendingGuestOrderDrafts;

        if (pendingOrdersToReplay.length > 0 || pendingPointsToClaim > 0) {
          for (const pendingOrder of pendingOrdersToReplay) {
            try {
              await ordersApi.create(pendingOrder);
            } catch {
              // Keep auth flow resilient even when replay order fails.
            }
          }

          if (pendingPointsToClaim > 0) {
            try {
              const rewardsResult = await usersApi.awardRewards(loggedInUser.id, { pointsToAdd: pendingPointsToClaim });
              setUser((currentUser) =>
                currentUser
                  ? {
                      ...currentUser,
                      pridePoints: rewardsResult.pridePoints,
                    }
                  : currentUser
              );
            } catch {
              // Keep auth flow resilient even when rewards claim fails.
            }
          }

          clearPendingGuestCheckout();
        }

        return loggedInUser;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setErrorMessage(message);
        setUser(null);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearPendingGuestCheckout, pendingGuestOrderDrafts, pendingGuestRewardPoints]
  );

  const beginDemoSession = useCallback((displayName: string) => {
    setErrorMessage(null);
    setUser({
      id: -1,
      userName: displayName.trim() || 'guest',
      pridePoints: 0,
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
      pendingGuestRewardPoints,
      signIn,
      beginDemoSession,
      signOut,
      refreshSession,
      queuePendingGuestCheckout,
      clearPendingGuestCheckout,
      clearError,
    }),
    [
      user,
      isLoading,
      errorMessage,
      pendingGuestRewardPoints,
      signIn,
      beginDemoSession,
      signOut,
      refreshSession,
      queuePendingGuestCheckout,
      clearPendingGuestCheckout,
      clearError,
    ]
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
