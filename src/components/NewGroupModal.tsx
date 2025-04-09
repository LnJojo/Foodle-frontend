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

// Définition des types
interface NewGroupData {
  name: string;
  description: string;
  privacy: string;
}

// Types pour les erreurs
interface FormErrors {
  name?: string;
  description?: string;
  privacy?: string;
  server?: string;
}

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupData: NewGroupData) => void;
}

const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>("private");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du nom du groupe
    if (!groupName.trim()) {
      newErrors.name = "Le nom du groupe est obligatoire";
    } else if (groupName.length < 3) {
      newErrors.name = "Le nom doit contenir au moins 3 caractères";
    } else if (groupName.length > 50) {
      newErrors.name = "Le nom ne peut pas dépasser 50 caractères";
    }
    // Validation de la description (optionnelle mais limitée en taille)
    if (description && description.length > 500) {
      newErrors.description =
        "La description ne peut pas dépasser 500 caractères";
    }
    // Validation de la confidentialité
    if (!privacy) {
      newErrors.privacy = "Veuillez sélectionner une option de confidentialité";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("Current token:", localStorage.getItem("token"));
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onCreateGroup({
        name: groupName,
        description,
        privacy,
      });

      // Réinitialiser le formulaire
      setGroupName("");
      setDescription("");
      setPrivacy("private");
      setErrors({});

      onClose();
    } catch (error: any) {
      // Gestion des erreurs du serveur
      const serverErrors = error.response?.data || {};

      // Mapper les erreurs du serveur aux champs du formulaire
      const formattedErrors: FormErrors = {};

      if (serverErrors.name) {
        formattedErrors.name = Array.isArray(serverErrors.name)
          ? serverErrors.name[0]
          : serverErrors.name;
      }

      if (serverErrors.description) {
        formattedErrors.description = Array.isArray(serverErrors.description)
          ? serverErrors.description[0]
          : serverErrors.description;
      }

      if (serverErrors.privacy) {
        formattedErrors.privacy = Array.isArray(serverErrors.privacy)
          ? serverErrors.privacy[0]
          : serverErrors.privacy;
      }

      // Erreur générale si aucune erreur spécifique n'est trouvée
      if (Object.keys(formattedErrors).length === 0) {
        formattedErrors.server =
          "Une erreur est survenue lors de la création du groupe";
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
            <DialogTitle>Créez un groupe</DialogTitle>
          </div>
          <DialogDescription>
            Créez un groupe pour inviter des amis et organiser des compétitions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {errors.server && (
            <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
              {errors.server}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="group-name" className="text-sm font-medium">
              Nom du groupe <span className="text-red-500">*</span>
            </label>
            <Input
              id="group-name"
              placeholder="Les Gourmets"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className={
                errors.name ? "border-red-300 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Décrivez votre groupe et son objectif..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="privacy" className="text-sm font-medium">
              Confidentialité
            </label>
            <Select value={privacy} onValueChange={setPrivacy}>
              <SelectTrigger id="privacy">
                <SelectValue placeholder="Choisir la confidentialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  Privé - Sur invitation uniquement
                </SelectItem>
                <SelectItem value="public">Public - Ouvert à tous</SelectItem>
              </SelectContent>
            </Select>
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
                Création...
              </>
            ) : (
              "Créer le groupe"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupModal;
