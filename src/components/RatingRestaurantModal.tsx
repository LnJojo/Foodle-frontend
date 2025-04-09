import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Restaurant, Rating as RatingType } from "@/types";

interface RatingRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (ratingData: {
    restaurantId: number;
    foodScore: number;
    serviceScore: number;
    ambianceScore: number;
    valueScore: number;
    comment: string;
  }) => Promise<void>;
  restaurant: Restaurant | null;
  existingRating?: RatingType | null;
}

const RatingRestaurantModal = ({
  isOpen,
  onClose,
  onSubmitRating,
  restaurant,
  existingRating,
}: RatingRestaurantModalProps) => {
  // États pour les différentes notes
  const [foodScore, setFoodScore] = useState(existingRating?.food_score || 5);
  const [serviceScore, setServiceScore] = useState(
    existingRating?.service_score || 5
  );
  const [ambianceScore, setAmbianceScore] = useState(
    existingRating?.ambiance_score || 5
  );
  const [valueScore, setValueScore] = useState(
    existingRating?.value_score || 5
  );
  const [comment, setComment] = useState(existingRating?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour générer les étoiles de notation
  const renderStars = (
    currentValue: number,
    onChange: (value: number) => void
  ) => {
    return (
      <div className="flex items-center">
        {[...Array(10)].map((_, index) => (
          <Star
            key={index}
            className={`h-6 w-6 cursor-pointer ${
              index < currentValue
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
            onClick={() => onChange(index + 1)}
          />
        ))}
        <span className="ml-2 font-medium">{currentValue}/10</span>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!restaurant) return;

    setIsSubmitting(true);
    try {
      await onSubmitRating({
        restaurantId: restaurant.id,
        foodScore,
        serviceScore,
        ambianceScore,
        valueScore,
        comment,
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'évaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {existingRating
              ? "Modifier votre évaluation"
              : "Noter le restaurant"}
          </DialogTitle>
          <DialogDescription>
            {restaurant?.name
              ? `Évaluez votre expérience chez ${restaurant.name}`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="food">Qualité de la nourriture</Label>
            {renderStars(foodScore, setFoodScore)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service</Label>
            {renderStars(serviceScore, setServiceScore)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ambiance">Ambiance</Label>
            {renderStars(ambianceScore, setAmbianceScore)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Rapport qualité-prix</Label>
            {renderStars(valueScore, setValueScore)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder="Partagez votre avis sur ce restaurant..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                Traitement...
              </>
            ) : existingRating ? (
              "Mettre à jour"
            ) : (
              "Soumettre l'évaluation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingRestaurantModal;
