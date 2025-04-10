import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import Logo from "@/assets/Logo.svg";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = React.memo(() => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  return (
    <nav className="bg-white">
      <div className="pt-6 pb-6 flex justify-between items-center border-b">
        <div className="flex-shrink-0 flex items-center h-full">
          <Link
            to={user ? "/dashboard" : "/"}
            className="text-2xl font-extrabold"
          >
            <img
              src={Logo}
              className="ml-6 h-8 w-auto transform scale-200 rounded border-1 border-black"
            />
          </Link>
        </div>

        {loading ? (
          <div className="mr-5 w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
        ) : user ? (
          <div className="mr-5 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="bg-amber-100 text-amber-800">
                {user.username?.substring(0, 2).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.username}</span>
            <Button
              variant="destructive"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mr-5 flex items-center gap-3">
            {/* Boutons de connexion et inscription */}
            <div className="mr-5 flex items-center gap-3">
              <Button variant="ghost">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button className="bg-amber-700 shadow-md hover:shadow-2xl">
                <Link to="/register">Inscription</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
