import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/api/api";
import { Loader2, Check, X } from "lucide-react";
import Logo from "../assets/Logo.svg";

const passwordRules = [
  { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { label: "Pas uniquement des chiffres", test: (p: string) => !/^\d+$/.test(p) },
  { label: "Contient au moins une lettre", test: (p: string) => /[a-zA-Z]/.test(p) },
];

const ResetPasswordPage = () => {
  useEffect(() => {
    document.title = "Nouveau mot de passe | Foodle";
  }, []);

  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordValid = passwordRules.every((rule) => rule.test(password));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) return;

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(uid!, token!, password, passwordConfirm);
      navigate("/login", {
        state: { message: "Mot de passe réinitialisé. Vous pouvez maintenant vous connecter." },
      });
    } catch (err: any) {
      const data = err.response?.data;
      setError(
        data?.token?.[0] ||
        data?.uid?.[0] ||
        data?.new_password2?.[0] ||
        data?.detail ||
        "Lien invalide ou expiré. Faites une nouvelle demande."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-3 left-3">
        <Link to="/">
          <img src={Logo} className="mt-3.5 ml-3 h-8 w-auto transform scale-200 rounded border-1 border-black" />
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription className="text-center">
            Choisissez un nouveau mot de passe pour votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-4 rounded-md text-red-500 text-sm">
                {error}
                {error.includes("expiré") && (
                  <p className="mt-2">
                    <Link to="/forgot-password" className="underline">
                      Faire une nouvelle demande
                    </Link>
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                required
                disabled={isLoading}
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
              className="w-full bg-amber-700 hover:bg-amber-600"
              disabled={isLoading || (passwordTouched && !passwordValid)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation...
                </>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
