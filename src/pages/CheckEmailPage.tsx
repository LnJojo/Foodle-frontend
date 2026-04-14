import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Logo from "../assets/Logo.svg";

const CheckEmailPage = () => {
  useEffect(() => {
    document.title = "Vérifiez votre email | Foodle";
  }, []);

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
            Vérifiez votre email
          </CardTitle>
          <CardDescription>
            Un email de confirmation a été envoyé à votre adresse.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Cliquez sur le lien dans l'email pour activer votre compte.
            Pensez à vérifier vos spams si vous ne le voyez pas.
          </p>
          <Link
            to="/login"
            className="text-amber-600 hover:text-amber-500 underline text-sm"
          >
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmailPage;
