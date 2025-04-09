import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 pt-10 pb-8 px-4 sm:pt-12 sm:px-6 md:pt-16 lg:pt-20 lg:px-8 xl:pt-28">
          <div className="sm:text-center lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">
                Organisez des compétitions
              </span>{" "}
              <span className="block text-amber-600 xl:inline">entre amis</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Découvrez de nouveaux restaurants avec vos amis et votez pour vos
              préférés. Suggérez, votez et découvrez les meilleurs
              établissements ensemble.
            </p>
            <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center lg:justify-start">
              <Button
                asChild
                variant="default"
                size="lg"
                className="bg-amber-700 hover:bg-amber-700"
              >
                <Link to="/register">Commencer</Link>
              </Button>
              {/*<Button asChild variant="outline" size="lg">
                <Link to="/about">En savoir plus</Link>
              </Button>*/}
            </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 pb-5 pt-5">
          <img
            className="h-56 w-full object-cover rounded-4xl shadow-xl sm:h-72 md:h-96 lg:h-full"
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Restaurant ambiance"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
