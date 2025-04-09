import React from "react";
import { Trophy } from "lucide-react";
import { Competition } from "@/types";

interface ProgressBarProps {
  competition: Competition;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ competition }) => {
  // Calcul du pourcentage de restaurants visités
  const calculateVisitedProgress = () => {
    if (!competition.restaurants || competition.restaurants.length === 0)
      return 0;

    const visitedCount = competition.restaurants.filter(
      (restaurant) => restaurant.ratings && restaurant.ratings.length > 0
    ).length;

    return Math.round((visitedCount / competition.restaurants.length) * 100);
  };

  const visitedProgress = calculateVisitedProgress();
  const visitedCount =
    competition.restaurants?.filter((r) => r.ratings && r.ratings.length > 0)
      .length || 0;
  const totalCount = competition.restaurants?.length || 0;

  // Déterminer la couleur en fonction de l'avancement
  const getProgressColor = (progress: number) => {
    if (progress < 25) return "bg-blue-500";
    if (progress < 50) return "bg-blue-400";
    if (progress < 75) return "bg-amber-400";
    return "bg-amber-500";
  };

  const progressColor = getProgressColor(visitedProgress);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Progression</span>
        <span className="text-sm font-medium text-gray-700">
          {visitedProgress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${progressColor}`}
          style={{ width: `${visitedProgress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {visitedCount} sur {totalCount} restaurants visités
      </p>

      {competition.status === "active" && visitedProgress === 100 && (
        <div className="flex items-center text-amber-600 mt-2">
          <Trophy className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">
            Tous les restaurants ont été visités !
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
