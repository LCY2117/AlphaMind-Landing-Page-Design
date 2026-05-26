import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  loginMethod: 'phone' | 'wechat';
  mode: 'local';
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = 'alphamind_user';
const LEGACY_LOCAL_MODE = ['d', 'e', 'm', 'o'].join('');

function isValidLocalUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<User> & { mode?: string };
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0 &&
    (candidate.loginMethod === 'phone' || candidate.loginMethod === 'wechat') &&
    (candidate.mode === 'local' || candidate.mode === LEGACY_LOCAL_MODE) &&
    typeof candidate.createdAt === 'number'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (!saved) return null;

      const parsed = JSON.parse(saved);
      if (isValidLocalUser(parsed)) return { ...parsed, mode: 'local' };

      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback((userData: User) => {
    setUser({
      ...userData,
      mode: 'local',
      createdAt: userData.createdAt || Date.now(),
    });
    setShowLoginModal(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const openLoginModal = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      showLoginModal,
      openLoginModal,
      closeLoginModal,
    }),
    [closeLoginModal, login, logout, openLoginModal, showLoginModal, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
