"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type User = {
  name: string;
  email: string;
  kycTier: number;
  accountNumber: string;
};

type LoginPayload = {
  identity: string;
  password: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  isReady: boolean;
  user: User | null;
  walletBalance: number;
  revenueBalance: number;
  commissionEarned: number;
  balanceVisible: boolean;
  dashboardMode: "personal" | "business";
  lastLogin: string | null;
  referralLink: string;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  toggleBalanceVisibility: () => void;
  toggleDashboardMode: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "bayright9ja-web-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [walletBalance] = useState(2450000);
  const [revenueBalance] = useState(6145000);
  const [commissionEarned] = useState(245500);
  const [user, setUser] = useState<User | null>(null);
  const [dashboardMode, setDashboardMode] = useState<"personal" | "business">("personal");
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [referralLink] = useState("https://bayright9ja.app/r/chukwudi");

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user: User;
          isAuthenticated: boolean;
          dashboardMode?: "personal" | "business";
          lastLogin?: string;
        };
        setUser(parsed.user);
        setIsAuthenticated(parsed.isAuthenticated);
        setDashboardMode(parsed.dashboardMode ?? "personal");
        setLastLogin(parsed.lastLogin ?? null);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsReady(true);
  }, []);

  const login = async ({ identity }: LoginPayload) => {
    const nextUser: User = {
      name: "Chukwudi Bayright",
      email: identity,
      kycTier: 2,
      accountNumber: "3021984421",
    };
    const timestamp = new Date().toISOString();

    setUser(nextUser);
    setIsAuthenticated(true);
    setLastLogin(timestamp);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: nextUser,
          isAuthenticated: true,
          dashboardMode,
          lastLogin: timestamp,
        }),
      );
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setLastLogin(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isReady,
      user,
      walletBalance,
      revenueBalance,
      commissionEarned,
      balanceVisible,
      dashboardMode,
      lastLogin,
      referralLink,
      login,
      logout,
      toggleBalanceVisibility: () => {
        setBalanceVisible((current) => !current);
      },
      toggleDashboardMode: () => {
        setDashboardMode((current) => {
          const nextMode = current === "personal" ? "business" : "personal";

          if (typeof window !== "undefined" && user) {
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                user,
                isAuthenticated,
                dashboardMode: nextMode,
                lastLogin,
              }),
            );
          }

          return nextMode;
        });
      },
    }),
    [
      balanceVisible,
      commissionEarned,
      dashboardMode,
      isAuthenticated,
      isReady,
      lastLogin,
      referralLink,
      revenueBalance,
      user,
      walletBalance,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
