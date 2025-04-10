import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";
import { useEffect } from "react";

const HomePage = () => {
  useEffect(() => {
    document.title = "Accueil | Foodle";
  }, []);
  return (
    <>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Hero />
        <Features />

        {/* Appel à l'action */}
        <div className="bg-amber-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">
                Prêt à commencer votre aventure culinaire?
              </span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-gray-200">
              Rejoignez Foodle aujourd'hui et commencez à organiser vos
              premières compétitions entre restaurants.
            </p>

            <a
              href="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-amber-800 bg-white hover:bg-indigo-50 sm:w-auto"
            >
              S'inscrire gratuitement
            </a>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default HomePage;
