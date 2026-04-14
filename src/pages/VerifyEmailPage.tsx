import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authService } from "@/api/api";
import { Loader2 } from "lucide-react";
import Logo from "../assets/Logo.svg";

const VerifyEmailPage = () => {
  useEffect(() => {
    document.title = "Vérification email | Foodle";
  }, []);

  const { key } = useParams<{ key: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!key) {
      setStatus("error");
      return;
    }

    authService.verifyEmail(key)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [key]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-3 left-3">
        <Link to="/">
          <img src={Logo} className="mt-3.5 ml-3 h-8 w-auto transform scale-200 rounded border-1 border-black" />
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && "Vérification..."}
            {status === "success" && "Email vérifié !"}
            {status === "error" && "Lien invalide"}
          </CardTitle>
          <CardDescription>
            {status === "loading" && (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Vérification de votre email en cours...
              </span>
            )}
            {status === "success" && "Votre compte est maintenant actif."}
            {status === "error" && "Ce lien est invalide ou a déjà été utilisé."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <Link
              to="/login"
              className="text-amber-600 hover:text-amber-500 underline text-sm"
            >
              Se connecter
            </Link>
          )}
          {status === "error" && (
            <Link
              to="/register"
              className="text-amber-600 hover:text-amber-500 underline text-sm"
            >
              Retour à l'inscription
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
