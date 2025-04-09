import { Users, Trophy, Star } from "lucide-react";

const Features = () => {
  return (
    <div className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-amber-700 mb-5">
          Comment ça marche ?
        </h2>
        <p className="text-lg text-center text-gray-700 max-w-3xl mx-auto mb-16">
          Découvrez comment organiser votre propre compétition de restaurants
          entre amis en quelques étapes simples.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative border rounded-lg p-6 bg-white shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-amber-700" />
            </div>

            <h3 className="text-xl font-bold text-center mb-3">
              Créez votre groupe
            </h3>

            <p className="text-gray-600 text-center">
              Invitez vos amis à rejoindre votre groupe pour participer aux
              compétitions culinaires que vous organiserez ensemble.
            </p>
          </div>
          <div className="relative border rounded-lg p-6 bg-white shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-amber-700" />
            </div>

            <h3 className="text-xl font-bold text-center mb-3">
              Lancez une compétition
            </h3>

            <p className="text-gray-600 text-center">
              Définissez les règles, la durée et le thème de votre compétition.
              Chaque participant propose un restaurant.
            </p>
          </div>
          <div className="relative border rounded-lg p-6 bg-white shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4">
              <Star className="w-10 h-10 text-amber-700" />
            </div>

            <h3 className="text-xl font-bold text-center mb-3">
              Notez et découvrez
            </h3>

            <p className="text-gray-600 text-center">
              Visitez les restaurants, notez votre expérience et découvrez le
              classement final à la fin de la compétition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
