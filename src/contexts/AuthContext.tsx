import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { authService } from "@/api/api";

import { User } from "@/types/index";

// Mettre à jour l'interface pour rendre le login plus flexible
interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
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
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setLoading(true);
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setError(null);
        } catch (err) {
          console.error(
            "Erreur lors de l'initialisation de l'authentification:",
            err
          );
          localStorage.removeItem("token");
          setUser(null);
          setError("Session expirée, veuillez vous reconnecter");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      setLoading(true);

      // Déterminer si l'entrée est un email ou un nom d'utilisateur
      const isEmail = usernameOrEmail.includes("@");

      // Créer l'objet de connexion approprié
      const loginData: LoginCredentials = {
        password,
      };

      // Affecter la valeur au bon champ
      if (isEmail) {
        loginData.email = usernameOrEmail;
      } else {
        loginData.username = usernameOrEmail;
      }

      const response = await authService.login(loginData);

      // Stocker le token
      if (response.key) {
        localStorage.setItem("token", response.key);
      } else if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Récupérer les informations de l'utilisateur
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
      localStorage.removeItem("token");
      setUser(null);
    } catch (err) {
      console.error("Erreur de déconnexion:", err);
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
