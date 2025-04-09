import { Heart, Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface GroupCardProps {
  id: number;
  name: string;
  member_count: number;
  competition_count: number;
  is_favorite: boolean;
}

const GroupCard = ({
  id,
  name,
  member_count,
  competition_count,
  is_favorite,
}: GroupCardProps) => {
  return (
    <Card className="w-full max-w-sm border-amber-600 bg-amber-100">
      <CardContent className="px-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg">{name}</h3>
          <Heart
            className={`h-5 w-5 ${
              is_favorite ? "fill-amber-600 text-amber-600" : "text-gray-300"
            }`}
          />
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Users className="h-4 w-4 mr-1" />
          <span>
            {member_count} membre{member_count > 1 ? "s" : ""}
          </span>
        </div>

        <div className="text-sm text-gray-700 mb-4">
          {competition_count} compétition
          {competition_count !== 1 ? "s" : ""}
        </div>

        <Link to={`/groups/${id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            Voir le groupe
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
