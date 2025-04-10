import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DatePickerClient } from "./ui/date-picker-client";

// Définition des types
interface FormErrors {
  name?: string;
  address?: string;
  cuisine_type?: string;
  visit_date?: string;
  image?: string;
  server?: string;
}

interface NewRestaurantData {
  name: string;
  address: string;
  cuisine_type: string;
  competition: number;
  visit_date: string;
  image?: File;
}

interface NewRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRestaurant: (restaurantData: NewRestaurantData) => Promise<void>;
  competitionId: number;
}

const CUISINE_TYPES = [
  { value: "francaise", label: "Française" },
  { value: "italienne", label: "Italienne" },
  { value: "japonaise", label: "Japonaise" },
  { value: "chinoise", label: "Chinoise" },
  { value: "indienne", label: "Indienne" },
  { value: "mexicaine", label: "Mexicaine" },
  { value: "libanaise", label: "Libanaise" },
  { value: "thai", label: "Thaïlandaise" },
  { value: "vegetarienne", label: "Végétarienne" },
  { value: "fusion", label: "Fusion" },
  { value: "autre", label: "Autre" },
];

const NewRestaurantModal: React.FC<NewRestaurantModalProps> = ({
  isOpen,
  onClose,
  onCreateRestaurant,
  competitionId,
}) => {
  const [name, setName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [cuisineType, setCuisineType] = useState<string>("");
  const [visitDate, setVisitDate] = useState<Date | undefined>(undefined);
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du nom
    if (!name.trim()) {
      newErrors.name = "Le nom du restaurant est obligatoire";
    } else if (name.length < 3) {
      newErrors.name = "Le nom doit contenir au moins 3 caractères";
    } else if (name.length > 100) {
      newErrors.name = "Le nom ne peut pas dépasser 100 caractères";
    }

    // Validation de l'adresse
    if (!address.trim()) {
      newErrors.address = "L'adresse est obligatoire";
    } else if (address.length < 5) {
      newErrors.address = "L'adresse doit contenir au moins 5 caractères";
    }

    // Validation du type de cuisine
    if (!cuisineType) {
      newErrors.cuisine_type = "Le type de cuisine est obligatoire";
    }

    // Validation de la date de visite
    if (!visitDate) {
      newErrors.visit_date = "La date de visite est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérification du type de fichier
      if (!file.type.startsWith("image/")) {
        setErrors({
          ...errors,
          image: "Le fichier doit être une image",
        });
        return;
      }

      // Vérification de la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          image: "L'image ne doit pas dépasser 5MB",
        });
        return;
      }

      setImage(file);
      // Effacer l'erreur si elle existe
      if (errors.image) {
        const newErrors = { ...errors };
        delete newErrors.image;
        setErrors(newErrors);
      }
    }
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setCuisineType("");
    setVisitDate(undefined);
    setImage(null);
    setDescription("");
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm() || !visitDate) return;

    setIsSubmitting(true);

    const formattedDate = visitDate.toISOString().split("T")[0]; // Format YYYY-MM-DD

    const restaurantData: NewRestaurantData = {
      name,
      address,
      cuisine_type: cuisineType,
      competition: competitionId,
      visit_date: formattedDate,
    };

    if (image) {
      restaurantData.image = image;
    }

    try {
      await onCreateRestaurant(restaurantData);
      toast.success("Restaurant ajouté avec succès !");
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du restaurant:", error);

      // Gestion des erreurs du serveur
      const serverErrors = error.response?.data || {};
      const formattedErrors: FormErrors = {};

      // Mapper les erreurs du serveur aux champs du formulaire
      if (serverErrors.name) {
        formattedErrors.name = serverErrors.name.join(" ");
      }
      if (serverErrors.address) {
        formattedErrors.address = serverErrors.address.join(" ");
      }
      if (serverErrors.cuisine_type) {
        formattedErrors.cuisine_type = serverErrors.cuisine_type.join(" ");
      }
      if (serverErrors.visit_date) {
        formattedErrors.visit_date = serverErrors.visit_date.join(" ");
      }
      if (serverErrors.image) {
        formattedErrors.image = serverErrors.image.join(" ");
      }

      // Si aucune erreur spécifique, afficher une erreur générale
      if (Object.keys(formattedErrors).length === 0) {
        formattedErrors.server =
          "Une erreur est survenue lors de l'ajout du restaurant";
        toast.error(formattedErrors.server);
      }

      setErrors(formattedErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un restaurant</DialogTitle>
          <DialogDescription>
            Proposez un restaurant pour la compétition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Affichage de l'erreur générale du serveur */}
          {errors.server && (
            <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
              {errors.server}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="restaurant-name" className="text-sm font-medium">
              Nom du restaurant<span className="text-red-500">*</span>
            </label>
            <Input
              id="restaurant-name"
              placeholder="Le Bistrot Parisien"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={
                errors.name ? "border-red-300 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Adresse<span className="text-red-500">*</span>
            </label>
            <Input
              id="address"
              placeholder="15 rue des Gourmands, Paris"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={
                errors.address
                  ? "border-red-300 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cuisine-type" className="text-sm font-medium">
              Type de cuisine<span className="text-red-500">*</span>
            </label>
            <Select value={cuisineType} onValueChange={setCuisineType}>
              <SelectTrigger
                id="cuisine-type"
                className={
                  errors.cuisine_type ? "border-red-300 focus:ring-red-500" : ""
                }
              >
                <SelectValue placeholder="Sélectionnez un type de cuisine" />
              </SelectTrigger>
              <SelectContent>
                {CUISINE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.cuisine_type && (
              <p className="text-red-500 text-xs mt-1">{errors.cuisine_type}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Date de visite proposée<span className="text-red-500">*</span>
            </label>
            <DatePickerClient
              date={visitDate}
              onSelect={setVisitDate}
              label="Date de visite"
            />
            {errors.visit_date && (
              <p className="text-red-500 text-xs mt-1">{errors.visit_date}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Image (optionnel)
            </label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={
                errors.image ? "border-red-300 focus-visible:ring-red-500" : ""
              }
            />
            {image && (
              <p className="text-xs text-gray-500">
                Image sélectionnée: {image.name}
              </p>
            )}
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (optionnel)
            </label>
            <Textarea
              id="description"
              placeholder="Décrivez brièvement ce restaurant..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Ajout...
              </>
            ) : (
              "Ajouter"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewRestaurantModal;
