import { Calendar, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface CompetitionCardProps {
  id: number;
  title: string;
  group: string;
  participants: number;
  endDate: string;
  status: "planning" | "active" | "completed";
}

const CompetitionCard = ({
  id,
  title,
  group,
  participants,
  endDate,
  status,
}: CompetitionCardProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non définie";

    try {
      // Si la date est déjà au format ISO (YYYY-MM-DD)
      if (dateString.includes("-")) {
        const [year, month, day] = dateString.split("-");
        return `${day}/${month}/${year}`;
      }

      // Si c'est déjà un format localisé (comme "14/04/2025")
      if (dateString.includes("/")) {
        return dateString;
      }

      // Pour les autres cas (timestamp, etc.)
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Date invalide"
        : date.toLocaleDateString("fr-FR");
    } catch {
      return "Date invalide";
    }
  };

  // Couleurs et libellés en fonction du statut
  const statusConfig = {
    active: {
      label: "En cours",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
    },
    planning: {
      label: "À venir",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
    },
    completed: {
      label: "Terminé",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-amber-100 rounded-lg border border-amber-600 shadow-sm p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </span>
      </div>

      <p className="text-gray-600 mb-4">
        Groupe: <span className="font-medium">{group}</span>
      </p>

      <div className="space-y-2 mb-6">
        <div className="flex items-center text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span>{participants} participants</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Fin: {formatDate(endDate)}</span>
        </div>
      </div>
      <Link to={`/competitions/${id}`}>
        <Button
          variant="outline"
          className="w-full text-white border-amber-600 bg-amber-600 hover:bg-amber-200 hover:text-amber-600"
        >
          Voir la compétition
        </Button>
      </Link>
    </div>
  );
};

export default CompetitionCard;
