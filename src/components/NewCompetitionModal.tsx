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
interface GroupType {
  id: number;
  name: string;
}

// Types pour les erreurs
interface FormErrors {
  name?: string;
  group?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: string;
  theme?: string;
  server?: string;
}

interface NewCompetitionData {
  name: string;
  group: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  theme?: string;
}

interface NewCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCompetition: (competitionData: NewCompetitionData) => void;
  userGroups?: GroupType[];
  preselectedGroupId?: string; // ID du groupe présélectionné
  preselectedGroupName?: string; // Nom du groupe présélectionné pour l'affichage
}

const NewCompetitionModal: React.FC<NewCompetitionModalProps> = ({
  isOpen,
  onClose,
  onCreateCompetition,
  userGroups = [],
  preselectedGroupId,
  preselectedGroupName,
}) => {
  const [name, setName] = useState<string>("");
  const [group, setGroup] = useState<string>(preselectedGroupId || "");
  const [description, setDescription] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [maxParticipants, setMaxParticipants] = useState<string>("8");
  const [theme, setTheme] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isGroupReadOnly = !!preselectedGroupId;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du nom
    if (!name.trim()) {
      newErrors.name = "Le nom de la compétition est obligatoire";
    } else if (name.length < 3) {
      newErrors.name = "Le nom doit contenir au moins 3 caractères";
    } else if (name.length > 50) {
      newErrors.name = "Le nom ne peut pas dépasser 50 caractères";
    }

    // Validation du groupe (uniquement si non présélectionné)
    if (!isGroupReadOnly && !group) {
      newErrors.group = "Veuillez sélectionner un groupe";
    }

    if (!description.trim()) {
      newErrors.description = "La description est obligatoire";
    } else if (description.length < 10) {
      newErrors.description =
        "La description doit contenir au moins 10 caractères";
    } else if (description.length > 500) {
      newErrors.description =
        "La description ne peut pas dépasser 500 caractères";
    }

    // Validation des dates
    if (!startDate) {
      newErrors.startDate = "La date de début est obligatoire";
    }

    if (!endDate) {
      newErrors.endDate = "La date de fin est obligatoire";
    } else if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = "La date de fin doit être après la date de début";
    }

    // Validation du nombre de participants
    const participants = parseInt(maxParticipants);
    if (isNaN(participants) || participants < 2) {
      newErrors.maxParticipants = "Le nombre minimum de participants est 2";
    } else if (participants > 20) {
      newErrors.maxParticipants = "Le nombre maximum de participants est 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !startDate || !endDate) return;

    setIsSubmitting(true);

    const groupToUse = isGroupReadOnly ? preselectedGroupId : group;

    const competitionData = {
      name,
      group: groupToUse,
      description,
      start_date: startDate.toISOString().split("T")[0], // Format YYYY-MM-DD
      end_date: endDate.toISOString().split("T")[0],
      max_participants: parseInt(maxParticipants),
      theme: theme || undefined,
    };

    console.log("Données envoyées:", competitionData);

    try {
      await onCreateCompetition({
        name,
        group: groupToUse,
        description,
        startDate,
        endDate,
        maxParticipants: parseInt(maxParticipants),
        theme: theme || undefined,
      });

      // Réinitialiser le formulaire
      setName("");
      setGroup("");
      setDescription("");
      setStartDate(undefined);
      setEndDate(undefined);
      setMaxParticipants("8");
      setTheme("");
      setErrors({});

      onClose();
    } catch (error: any) {
      // Mapper les erreurs du serveur aux champs du formulaire
      const formattedErrors: FormErrors = {};

      // Mapper chaque champ possible...

      // Erreur générale si aucune erreur spécifique n'est trouvée
      if (Object.keys(formattedErrors).length === 0) {
        formattedErrors.server =
          "Une erreur est survenue lors de la création de la compétition";
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
          <div className="flex justify-between items-center">
            <DialogTitle>
              Définissez les détails de votre compétition
            </DialogTitle>
          </div>
          <DialogDescription>
            Définissez les détails de votre compétition de restaurants.
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
            <label htmlFor="competition-name" className="text-sm font-medium">
              Nom de la compétition<span className="text-red-500">*</span>
            </label>
            <Input
              id="competition-name"
              placeholder="Tour des Bistrots"
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
            <label htmlFor="group" className="text-sm font-medium">
              Groupe<span className="text-red-500">*</span>
            </label>
            <Select
              value={group}
              onValueChange={setGroup}
              disabled={!!preselectedGroupId}
            >
              <SelectTrigger
                id="group"
                className={`
        ${errors.group ? "border-red-300 focus:ring-red-500" : ""}
        ${preselectedGroupId ? "bg-gray-50" : ""}
      `}
              >
                <SelectValue placeholder="Sélectionnez un groupe" />
              </SelectTrigger>
              <SelectContent>
                {userGroups.length > 0 ? (
                  userGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="1">Les Gourmets</SelectItem>
                    <SelectItem value="2">Collègues Foodie</SelectItem>
                    <SelectItem value="3">Amis du Quartier</SelectItem>
                  </>
                )}
                {/* Ajout d'une option pour le groupe présélectionné s'il n'est pas déjà dans la liste */}
                {preselectedGroupId &&
                  preselectedGroupName &&
                  !userGroups.some(
                    (g) => g.id.toString() === preselectedGroupId
                  ) && (
                    <SelectItem value={preselectedGroupId}>
                      {preselectedGroupName}
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
            {preselectedGroupId && preselectedGroupName && (
              <p className="text-xs text-gray-500">
                Cette compétition sera créée dans le groupe "
                {preselectedGroupName}"
              </p>
            )}
            {errors.group && (
              <p className="text-red-500 text-xs mt-1">{errors.group}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description<span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              placeholder="Décrivez le thème et les règles de votre compétition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={
                errors.description
                  ? "border-red-300 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date de début<span className="text-red-500">*</span>
              </label>
              <DatePickerClient
                date={startDate}
                onSelect={setStartDate}
                label="Date de début"
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date de fin<span className="text-red-500">*</span>
              </label>
              <DatePickerClient
                date={endDate}
                onSelect={setEndDate}
                label="Date de fin"
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="max-participants" className="text-sm font-medium">
              Nombre maximum de participants
              <span className="text-red-500">*</span>
            </label>
            <Input
              id="max-participants"
              type="number"
              min="2"
              max="20"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className={
                errors.maxParticipants
                  ? "border-red-300 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.maxParticipants && (
              <p className="text-red-500 text-xs mt-1">
                {errors.maxParticipants}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="theme" className="text-sm font-medium">
              Thème culinaire (optionnel)
            </label>
            <Input
              id="theme"
              placeholder="Ex: Cuisine italienne, Restaurants asiatiques..."
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={
                errors.theme ? "border-red-300 focus-visible:ring-red-500" : ""
              }
            />
            {errors.theme && (
              <p className="text-red-500 text-xs mt-1">{errors.theme}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700"
            onClick={handleSubmit}
            disabled={isSubmitting || userGroups.length === 0}
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
                Création...
              </>
            ) : (
              "Créer la compétition"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewCompetitionModal;
