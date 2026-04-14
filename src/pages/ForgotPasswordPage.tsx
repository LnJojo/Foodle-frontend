import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { Loader2 } from "lucide-react";
import Logo from "../assets/Logo.svg";

const ForgotPasswordPage = () => {
  useEffect(() => {
    document.title = "Mot de passe oublié | Foodle";
  }, []);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Vérifiez l'adresse email et réessayez.");
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
            Mot de passe oublié
          </CardTitle>
          <CardDescription className="text-center">
            {sent
              ? "Email envoyé !"
              : "Entrez votre email pour recevoir un lien de réinitialisation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">
                Si un compte existe avec l'adresse <strong>{email}</strong>,
                vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
              </p>
              <p className="text-sm text-gray-500">
                Pensez à vérifier vos spams.
              </p>
              <Link to="/login" className="text-amber-600 hover:text-amber-500 text-sm underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 p-4 rounded-md text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="votre@email.com"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-700 hover:bg-amber-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </Button>
              <p className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-amber-600 hover:text-amber-500 underline">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
