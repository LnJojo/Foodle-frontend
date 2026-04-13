// src/pages/RegisterPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { authService } from "@/api/api";
import { Loader2, Check, X } from "lucide-react";

// Règles calquées sur les validators Django
const passwordRules = [
  { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { label: "Pas uniquement des chiffres", test: (p: string) => !/^\d+$/.test(p) },
  { label: "Contient au moins une lettre", test: (p: string) => /[a-zA-Z]/.test(p) },
];

const RegisterPage = () => {
  useEffect(() => {
    document.title = "Inscription | Foodle";
  }, []);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const navigate = useNavigate();

  const passwordValid = passwordRules.every((rule) => rule.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Réinitialisation des erreurs
    setError("");
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setIsLoading(true);

    if (!passwordValid) {
      setIsLoading(false);
      return;
    }

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      await authService.register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
      });
      navigate("/login", {
        state: {
          message:
            "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
        },
      });
    } catch (err: any) {
      const data = err.response?.data;

      if (data?.email) setEmailError(Array.isArray(data.email) ? data.email[0] : data.email);
      if (data?.username) setUsernameError(Array.isArray(data.username) ? data.username[0] : data.username);
      if (data?.password1) setPasswordError(Array.isArray(data.password1) ? data.password1[0] : data.password1);

      // N'afficher l'erreur générale que si aucune erreur de champ n'est disponible
      const hasFieldError = data?.email || data?.username || data?.password1;
      if (!hasFieldError) {
        setError(data?.detail || data?.non_field_errors?.[0] || "Une erreur est survenue lors de l'inscription");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validation de l'email en temps réel
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Veuillez entrer une adresse email valide");
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Inscription
          </CardTitle>
          <CardDescription className="text-center">
            Créez un compte pour commencer à organiser vos compétitions
          </CardDescription>
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
                disabled={isLoading}
                className={usernameError ? "border-red-500" : ""}
              />
              {usernameError && (
                <p className="text-red-500 text-sm">{usernameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && (
                <p className="text-red-500 text-sm">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                required
                disabled={isLoading}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordTouched && (
                <ul className="space-y-1 mt-1">
                  {passwordRules.map((rule) => {
                    const ok = rule.test(password);
                    return (
                      <li key={rule.label} className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-red-500"}`}>
                        {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmez le mot de passe</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={!!emailError || (passwordTouched && !passwordValid) || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inscription en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Déjà un compte?{" "}
            <Link
              to="/login"
              className="text-amber-600 hover:text-amber-500 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
