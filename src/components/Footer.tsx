import { Link } from "react-router-dom";
import Logo from "../assets/Logo.svg";

const Footer = () => {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 flex justify-between items-center overflow-hidden sm:px-6 lg:px-8">
        <div className="flex-shrink-0 flex items-center h-full">
          <Link to={"/"} className="text-2xl font-extrabold">
            <img
              src={Logo}
              className="ml-6 h-8 w-auto transform scale-200 rounded border-1 border-black"
            ></img>
          </Link>
        </div>
        <nav className="-mx-5 -my-2 flex flex-wrap">
          <div className="px-5 py-2">
            <Link
              to="/"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Confidentialité
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              to="/"
              className="text-base text-gray-500 hover:text-gray-900"
            >
              Conditions d'utilisation
            </Link>
          </div>
          <p className="px-5 py-2 text-center text-base text-gray-400">
            &copy; 2025 Foodle. Tous droits réservés.
          </p>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
