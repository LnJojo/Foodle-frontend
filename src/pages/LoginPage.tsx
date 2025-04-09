import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "../assets/Logo.svg";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer les paramètres de redirection de l'URL
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(username, password);

      // Vérifier s'il y a une invitation en attente dans sessionStorage
      const pendingInvitation = sessionStorage.getItem("pendingInvitation");

      if (pendingInvitation) {
        // Si une invitation est en attente, rediriger vers sa page
        navigate(`/invite/${pendingInvitation}`);
      } else {
        // Sinon, utiliser le chemin de redirection fourni dans l'URL
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Une erreur est survenue lors de la connexion"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-3 left-3">
        <Link to={"/"}>
          <img
            src={Logo}
            className="mt-3.5 ml-3 h-8 w-auto transform scale-200 rounded border-1 border-black"
          />
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Connexion
          </CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder à votre compte
          </CardDescription>
          {redirectPath && redirectPath.includes("/invite/") && (
            <div className="mt-2 text-sm text-amber-600 text-center">
              Connectez-vous pour rejoindre le groupe
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="remember">Se souvenir de moi</Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-amber-600 hover:text-amber-500 underline"
                >
                  Mot de passe oublié?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-600"
            >
              Se connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte?{" "}
            <Link
              to="/register"
              className="text-amber-600 hover:text-amber-500 font-medium underline"
            >
              S'inscrire
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
