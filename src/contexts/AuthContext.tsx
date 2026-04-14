import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { authService } from "@/api/api";

import { User } from "@/types/index";

interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
  remember_me: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        // Vérifie si l'utilisateur est déjà connecté via cookie JWT
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setError(null);
      } catch {
        // Pas de session active — état normal pour un utilisateur non connecté
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);

      // Déterminer si l'entrée est un email ou un nom d'utilisateur
      const isEmail = usernameOrEmail.includes("@");

      const loginData: LoginCredentials = {
        password,
        remember_me: rememberMe,
      };

      if (isEmail) {
        loginData.email = usernameOrEmail;
      } else {
        loginData.username = usernameOrEmail;
      }

      await authService.login(loginData);

      // Le backend a posé les cookies JWT httpOnly — on récupère juste le profil
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      setError(err.response?.data?.detail || "Erreur de connexion");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      // Le backend supprime les cookies JWT — pas de localStorage à nettoyer
      setUser(null);
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isAuthenticated, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
