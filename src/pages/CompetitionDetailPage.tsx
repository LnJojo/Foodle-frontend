import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Star,
  Clock,
  Plus,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Competition,
  CreateCompetitionRequest,
  Rating,
  Restaurant,
  User,
} from "@/types";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  competitionService,
  ratingService,
  restaurantService,
} from "@/api/api";
import NewRestaurantModal from "@/components/NewRestaurantModal";
import { useAuth } from "@/contexts/AuthContext";
import RatingRestaurantModal from "@/components/RatingRestaurantModal";

const CompetitionDetailPage = () => {
  useEffect(() => {
    document.title = "Compétition | Foodle";
  }, []);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);
  const [userRatings, setUserRatings] = useState<{
    [key: number]: Rating | null;
  }>({});
  const [restaurantRatings, setRestaurantRatings] = useState<{
    [key: number]: Rating[];
  }>({});
  const [participantRankings, setParticipantRankings] = useState<
    Array<{
      user: User;
      averageScore: number;
    }>
  >([]);
  const [sortOption, setSortOption] = useState<string>("default");
  const [isParticipant, setIsParticipant] = useState<boolean>(false);
  const [isCreator, setIsCreator] = useState<boolean>(false);
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
  const [isJoiningCompetition, setIsJoiningCompetition] = useState(false);

  // Fonction pour déterminer si un restaurant a été visité (a des évaluations)
  const isRestaurantVisited = useCallback(
    (restaurant: Restaurant) => {
      // Vérifier si le restaurant a des évaluations
      const hasRatings = restaurantRatings[restaurant.id]?.length > 0;

      // Vérifier si la date de visite est passée
      const visitDate = new Date(restaurant.visit_date);
      const today = new Date();
      const isDatePassed = visitDate < today;

      // Un restaurant est considéré comme visité si sa date est passée ET s'il a des évaluations
      return isDatePassed && hasRatings;
    },
    [restaurantRatings]
  );

  // Fonction pour déterminer si un restaurant est à venir (futur) ou passé (sans évaluations)
  const isRestaurantUpcoming = (restaurant: Restaurant) => {
    const visitDate = new Date(restaurant.visit_date);
    const today = new Date();
    return visitDate >= today;
  };

  // Fonction pour formater la date de visite
  const formatVisitDate = (dateString: string) => {
    const visitDate = new Date(dateString);

    // Options pour le format de date
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };

    // Formater la date
    const formattedDate = visitDate.toLocaleDateString("fr-FR", dateOptions);

    return formattedDate;
  };

  // Fonction pour vérifier si l'utilisateur courant a déjà noté un restaurant
  const hasUserRated = (restaurant: Restaurant) => {
    return (
      userRatings[restaurant.id] !== undefined &&
      userRatings[restaurant.id] !== null
    );
  };
  // Fonction pour récupérer la note de l'utilisateur courant pour un restaurant
  const getUserRating = (restaurant: Restaurant) => {
    return userRatings[restaurant.id] || null;
  };

  const checkIfUserIsParticipant = (user: User, participants: User[]) => {
    if (!user || !participants) {
      return false;
    }

    const userId = user.id !== undefined ? user.id : user.pk;

    return participants.some((participant) => participant.id === userId);
  };

  const checkIfUserIsCreator = (user: User, competition: Competition) => {
    if (!user || !competition.creator) {
      return false;
    }

    const userId = user.id !== undefined ? user.id : user.pk;
    const creatorId =
      competition.creator.id !== undefined
        ? competition.creator.id
        : competition.creator.pk;

    return userId === creatorId;
  };

  const canRateRestaurant = (restaurant: Restaurant) => {
    // Vérifier si la compétition est terminée
    if (competition?.status === "completed") {
      return false;
    }

    // Vérifier si la date de visite est passée
    const visitDate = new Date(restaurant.visit_date);
    const today = new Date();
    return visitDate <= today;
  };

  const updateParticipantRankings = useCallback(() => {
    if (
      !competition?.participants ||
      !competition.restaurants ||
      !restaurantRatings
    ) {
      return;
    }

    // Map pour stocker les scores par participant
    const participantScores: {
      [userId: number]: {
        user: User;
        totalScore: number;
        ratedRestaurantsCount: number;
      };
    } = {};

    // Initialiser les données pour chaque participant
    competition.participants.forEach((participant) => {
      const userId =
        participant.id !== undefined ? participant.id : participant.pk;
      if (userId !== undefined) {
        participantScores[userId] = {
          user: participant,
          totalScore: 0,
          ratedRestaurantsCount: 0,
        };
      }
    });

    // Calculer le score moyen pour chaque restaurant suggéré par un participant
    competition.restaurants.forEach((restaurant) => {
      const suggestedById =
        restaurant.suggested_by?.id || restaurant.suggested_by?.pk;
      if (!suggestedById || !participantScores[suggestedById]) {
        return; // Ignorer si le proposant n'est pas un participant ou n'est pas identifié
      }

      const ratings = restaurantRatings[restaurant.id];
      if (ratings && ratings.length > 0) {
        // Calculer le score moyen de ce restaurant
        const totalRestaurantScore = ratings.reduce(
          (sum, rating) => sum + rating.overall_score,
          0
        );
        const averageRestaurantScore = totalRestaurantScore / ratings.length;

        // Ajouter ce score au score total du participant
        participantScores[suggestedById].totalScore += averageRestaurantScore;
        participantScores[suggestedById].ratedRestaurantsCount++;
      }
    });

    // Transformer en tableau et calculer les moyennes
    const rankings = Object.values(participantScores).map((data) => {
      const averageScore =
        data.ratedRestaurantsCount > 0
          ? parseFloat(
              (data.totalScore / data.ratedRestaurantsCount).toFixed(1)
            )
          : 0;

      return {
        user: data.user,
        averageScore,
      };
    });

    // Trier par score moyen (du plus élevé au plus bas)
    const sortedRankings = rankings.sort(
      (a, b) => b.averageScore - a.averageScore
    );
    setParticipantRankings(sortedRankings);
  }, [competition, restaurantRatings]);

  // Fonction pour ouvrir le modal d'évaluation
  const handleOpenRatingModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    const rating = getUserRating(restaurant);
    setExistingRating(rating);
    setIsRatingModalOpen(true);
  };

  // Fonction pour gérer la soumission d'une évaluation
  const handleSubmitRating = async (ratingData: {
    restaurantId: number;
    foodScore: number;
    serviceScore: number;
    ambianceScore: number;
    valueScore: number;
    comment: string;
  }) => {
    if (!selectedRestaurant) return;

    // Fermer le modal immédiatement
    setIsRatingModalOpen(false);

    const toastId = toast.loading("Enregistrement de votre évaluation...");

    try {
      const payload = {
        restaurant: ratingData.restaurantId,
        food_score: ratingData.foodScore,
        service_score: ratingData.serviceScore,
        ambiance_score: ratingData.ambianceScore,
        value_score: ratingData.valueScore,
        comment: ratingData.comment,
      };

      // Calculer le score moyen
      const overallScore = Math.round(
        (ratingData.foodScore +
          ratingData.serviceScore +
          ratingData.ambianceScore +
          ratingData.valueScore) /
          4
      );

      const optimisticRating: Rating = {
        id: existingRating?.id || Date.now(), // ID temporaire si nouvelle note
        restaurant: selectedRestaurant.id,
        user: user!,
        food_score: ratingData.foodScore,
        service_score: ratingData.serviceScore,
        ambiance_score: ratingData.ambianceScore,
        value_score: ratingData.valueScore,
        overall_score: overallScore,
        comment: ratingData.comment,
        // Conserver created_at s'il existe déjà
        created_at: existingRating?.created_at || new Date().toISOString(),
      };

      // Mise à jour des états
      if (existingRating) {
        // Mise à jour d'une note existante
        setUserRatings((prev) => ({
          ...prev,
          [selectedRestaurant.id]: optimisticRating,
        }));

        setRestaurantRatings((prev) => {
          const restaurantRatingsList = [
            ...(prev[selectedRestaurant.id] || []),
          ];
          const existingIndex = restaurantRatingsList.findIndex(
            (r) => r.id === existingRating.id
          );

          if (existingIndex >= 0) {
            restaurantRatingsList[existingIndex] = optimisticRating;
          }

          return {
            ...prev,
            [selectedRestaurant.id]: restaurantRatingsList,
          };
        });

        // Effectuer la mise à jour réelle
        await ratingService.updateRating(existingRating.id, payload);
      } else {
        // Création d'une nouvelle évaluation
        setUserRatings((prev) => ({
          ...prev,
          [selectedRestaurant.id]: optimisticRating,
        }));

        setRestaurantRatings((prev) => ({
          ...prev,
          [selectedRestaurant.id]: [
            ...(prev[selectedRestaurant.id] || []),
            optimisticRating,
          ],
        }));

        // Effectuer la création réelle
        await ratingService.createRating(payload);
      }

      // Récupérer les données à jour
      const updatedRatings = await ratingService.getRatings(
        selectedRestaurant.id
      );

      // Mettre à jour l'état restaurantRatings
      setRestaurantRatings((prev) => ({
        ...prev,
        [selectedRestaurant.id]: updatedRatings,
      }));

      // Mettre à jour userRatings
      if (user) {
        const userId = user.id !== undefined ? user.id : user.pk;
        const freshUserRating = updatedRatings.find(
          (rating) => rating.user.id === userId || rating.user.pk === userId
        );

        setUserRatings((prev) => ({
          ...prev,
          [selectedRestaurant.id]: freshUserRating || null,
        }));
      }

      // Mettre à jour le classement des participants
      updateParticipantRankings();

      toast.dismiss(toastId);
      toast.success(
        existingRating
          ? "Votre évaluation a été mise à jour avec succès !"
          : "Votre évaluation a été soumise avec succès !"
      );
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation:", error);
      toast.dismiss(toastId);
      toast.error(
        "Une erreur est survenue lors de la soumission de votre évaluation"
      );
      throw error;
    } finally {
      setSelectedRestaurant(null);
      setExistingRating(null);
    }
  };

  // Fonction pour calculer le classement des participants
  const calculateRankings = () => {
    if (
      !competition?.participants ||
      !competition.restaurants ||
      !restaurantRatings
    ) {
      return [];
    }

    // Map pour stocker les scores par participant
    const participantScores: {
      [userId: number]: {
        user: User;
        totalScore: number;
        ratedRestaurantsCount: number;
      };
    } = {};

    // Initialiser les données pour chaque participant
    competition.participants.forEach((participant) => {
      const userId =
        participant.id !== undefined ? participant.id : participant.pk;
      if (userId !== undefined) {
        participantScores[userId] = {
          user: participant,
          totalScore: 0,
          ratedRestaurantsCount: 0,
        };
      }
    });

    // Calculer le score moyen pour chaque restaurant suggéré par un participant
    competition.restaurants.forEach((restaurant) => {
      const suggestedById =
        restaurant.suggested_by?.id || restaurant.suggested_by?.pk;
      if (!suggestedById || !participantScores[suggestedById]) {
        return; // Ignorer si le proposant n'est pas un participant ou n'est pas identifié
      }

      const ratings = restaurantRatings[restaurant.id];
      if (ratings && ratings.length > 0) {
        // Calculer le score moyen de ce restaurant
        const totalRestaurantScore = ratings.reduce(
          (sum, rating) => sum + rating.overall_score,
          0
        );
        const averageRestaurantScore = totalRestaurantScore / ratings.length;

        // Ajouter ce score au score total du participant
        participantScores[suggestedById].totalScore += averageRestaurantScore;
        participantScores[suggestedById].ratedRestaurantsCount++;
      }
    });

    // Transformer en tableau et calculer les moyennes
    const rankings = Object.values(participantScores).map((data) => {
      const averageScore =
        data.ratedRestaurantsCount > 0
          ? parseFloat(
              (data.totalScore / data.ratedRestaurantsCount).toFixed(1)
            )
          : 0;

      return {
        user: data.user,
        averageScore,
      };
    });

    // Trier par score moyen (du plus élevé au plus bas)
    return rankings.sort((a, b) => b.averageScore - a.averageScore);
  };

  const handleFinishCompetition = async () => {
    if (!competition || !isCreator) return;

    const toastId = toast.loading("Finalisation de la compétition en cours...");

    try {
      setCompetition({
        ...competition,
        status: "completed",
      });

      // Mettre à jour le statut de la compétition
      await competitionService.updateCompetition(competition.id, {
        status: "completed",
      } as Partial<CreateCompetitionRequest>);

      toast.dismiss(toastId);
      toast.success(
        "La compétition a été marquée comme terminée avec succès !"
      );
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setCompetition({
        ...competition,
        status: competition.status, // Revenir au statut d'origine
      });

      console.error(
        "Erreur lors de la tentative de terminer la compétition:",
        error
      );
      toast.dismiss(toastId);
      toast.error("Échec lors de la tentative de terminer la compétition");
    } finally {
    }
  };

  // Fonction pour filtrer et trier les restaurants
  const getFilteredAndSortedRestaurants = useMemo(() => {
    if (!competition || !competition.restaurants) return [];

    // Filtrer les restaurants selon l'option "À venir uniquement"
    let filteredRestaurants = competition.restaurants;
    if (showUpcoming) {
      filteredRestaurants = filteredRestaurants.filter(
        (restaurant) => !isRestaurantVisited(restaurant)
      );
    }

    // Trier les restaurants selon l'option de tri sélectionnée
    return [...filteredRestaurants].sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return (
            new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime()
          );
        case "date-desc":
          return (
            new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
          );
        default:
          // Par défaut, on garde l'ordre existant
          return 0;
      }
    });
  }, [competition, showUpcoming, sortOption, isRestaurantVisited]);

  const handleCreateRestaurant = async (restaurantData: any) => {
    setIsCreatingRestaurant(true);
    setIsRestaurantModalOpen(false);

    const toastId = toast.loading("Ajout du restaurant en cours...");

    try {
      const optimisticRestaurant: Restaurant = {
        id: Date.now(), // ID temporaire
        name: restaurantData.name,
        address: restaurantData.address,
        visit_date: restaurantData.visit_date,
        suggested_by: user!,
        created_at: new Date().toISOString(),
        cuisine_type: "",
        average_rating: 0,
        ratings: [],
      };

      if (competition) {
        setCompetition({
          ...competition,
          restaurants: [
            ...(competition.restaurants || []),
            optimisticRestaurant,
          ],
        });
      }

      // Créer le restaurant
      const newRestaurant = await restaurantService.createRestaurant(
        restaurantData
      );

      // Mettre à jour l'état avec les données du serveur
      if (competition) {
        setCompetition((prev) => {
          if (!prev) return prev;

          // Remplacer le restaurant optimiste par celui renvoyé par le serveur
          const updatedRestaurants = prev.restaurants.map((r) =>
            r.id === optimisticRestaurant.id ? newRestaurant : r
          );

          return {
            ...prev,
            restaurants: updatedRestaurants,
          };
        });
      }

      // Initialiser le tableau des évaluations pour ce restaurant
      setRestaurantRatings((prev) => ({
        ...prev,
        [newRestaurant.id]: [],
      }));

      toast.dismiss(toastId);
      toast.success("Restaurant ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout du restaurant:", error);

      // En cas d'erreur, on retire le restaurant optimiste
      if (competition) {
        setCompetition({
          ...competition,
          restaurants: competition.restaurants.filter(
            (r) => typeof r.id === "number"
          ),
        });
      }

      toast.dismiss(toastId);
      toast.error("Erreur lors de l'ajout du restaurant");
      throw error;
    } finally {
      setIsCreatingRestaurant(false);
    }
  };

  const handleJoinCompetition = async () => {
    if (!competition || !user) return;

    setIsJoiningCompetition(true);
    const toastId = toast.loading("Inscription à la compétition en cours...");

    try {
      // Mise à jour optimiste de l'interface
      setIsParticipant(true);

      // Mettre à jour l'état local
      if (competition.participants && user) {
        setCompetition({
          ...competition,
          participants: [...competition.participants, user],
          participant_count: competition.participant_count + 1,
        });
      }

      // Rejoindre la compétition
      await competitionService.joinCompetition(competition.id);

      toast.dismiss(toastId);
      toast.success("Vous avez rejoint la compétition avec succès !");
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setIsParticipant(false);
      if (competition.participants) {
        setCompetition({
          ...competition,
          participants: [...competition.participants], // Revenir à la liste d'origine
          participant_count: competition.participant_count,
        });
      }

      console.error(
        "Erreur lors de la tentative de rejoindre la compétition:",
        error
      );
      toast.dismiss(toastId);
      toast.error("Échec lors de la tentative de rejoindre la compétition");
    } finally {
      setIsJoiningCompetition(false);
    }
  };

  const fetchCompetition = async () => {
    try {
      if (!id) return;

      setLoading(true);

      // Chargement de la compétition
      const data = await competitionService.getCompetition(Number(id));
      setCompetition(data);

      // Vérification si l'utilisateur est participant
      if (user && data.participants) {
        if (data.participants) {
          const userIsParticipant = checkIfUserIsParticipant(
            user,
            data.participants
          );
          setIsParticipant(userIsParticipant);
        }
        const userIsCreator = checkIfUserIsCreator(user, data);
        setIsCreator(userIsCreator);
      }

      // Chargement immédiat des évaluations pour chaque restaurant
      if (data.restaurants && data.restaurants.length > 0) {
        // Créer un tableau de promesses pour toutes les requêtes d'évaluation
        const ratingsPromises = data.restaurants.map((restaurant) =>
          ratingService.getRatings(restaurant.id)
        );

        // Exécuter toutes les promesses
        const ratingsResults = await Promise.all(ratingsPromises);

        // Construire les maps d'évaluations
        const ratingsMap: { [key: number]: Rating[] } = {};
        const userRatingsMap: { [key: number]: Rating | null } = {};

        // Parcourir les résultats et les organiser
        data.restaurants.forEach((restaurant, index) => {
          const ratings = ratingsResults[index];
          ratingsMap[restaurant.id] = ratings;

          // Si l'utilisateur est connecté, trouver son évaluation
          if (user) {
            const userId = user.id !== undefined ? user.id : user.pk;
            const userRating = ratings.find(
              (rating) => rating.user.id === userId || rating.user.pk === userId
            );
            userRatingsMap[restaurant.id] = userRating || null;
          }
        });

        // Mettre à jour les états avec les données chargées
        setRestaurantRatings(ratingsMap);
        setUserRatings(userRatingsMap);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la compétition:", error);
      toast.error("Erreur lors du chargement de la compétition");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchCompetition();
    };

    if (id && user) {
      fetchData();
    }
  }, [id, user]);

  // Charger les restaurants séparément si nécessaire
  useEffect(() => {
    const loadRestaurantsIfNeeded = async () => {
      // Si la compétition existe mais n'a pas de restaurants ou tableau vide
      if (
        competition &&
        (!competition.restaurants || competition.restaurants.length === 0)
      ) {
        try {
          // Charger les restaurants spécifiquement pour cette compétition
          const restaurantsData = await restaurantService.getRestaurants(
            competition.id
          );

          // Mettre à jour la compétition avec les restaurants
          setCompetition({
            ...competition,
            restaurants: restaurantsData,
          });
        } catch (error) {
          console.error("Erreur lors du chargement des restaurants:", error);
        }
      }
    };

    loadRestaurantsIfNeeded();
  }, [competition?.id]);

  useEffect(() => {
    if (competition?.participants && restaurantRatings) {
      const rankings = calculateRankings();
      setParticipantRankings(rankings);
    }
  }, [competition, restaurantRatings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calcul de la progression (restaurants visités)
  const progress = useMemo(() => {
    if (!competition?.restaurants || competition.restaurants.length === 0) {
      return { visitedCount: 0, totalCount: 0, percentage: 0 };
    }

    // Compter les restaurants qui ont été visités (date passée ET évalués)
    const visitedCount = competition.restaurants.filter((restaurant) =>
      isRestaurantVisited(restaurant)
    ).length;

    const totalCount = competition.restaurants.length;

    // Calculer le pourcentage
    const percentage = Math.round((visitedCount / totalCount) * 100);

    return { visitedCount, totalCount, percentage };
  }, [competition, isRestaurantVisited]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Compétition non trouvée
      </div>
    );
  }

  const statusText =
    competition.status === "active"
      ? "En cours"
      : competition.status === "planning"
      ? "À venir"
      : "Terminé";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="flex items-start justify-between mb-2 sm:mb-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words pr-2">
                  {competition.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Groupe: {competition.group_name}
                </p>
              </div>
              <span className="px-3 py-1 text-sm rounded-full bg-amber-100 text-amber-800 whitespace-nowrap ml-2">
                {statusText}
              </span>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              {isCreator &&
                (competition.status === "active" ||
                  competition.status === "planning") && (
                  <Button
                    variant="outline"
                    onClick={handleFinishCompetition}
                    disabled={
                      competition.status ===
                      ("completed" as Competition["status"])
                    }
                    className="border-amber-600 text-amber-700 hover:bg-amber-50 flex-1 sm:flex-none"
                    size="sm"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Terminer</span>
                  </Button>
                )}
              {isParticipant ? (
                <Button
                  className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-none"
                  disabled={
                    competition.status === "completed" || isCreatingRestaurant
                  }
                  onClick={() => setIsRestaurantModalOpen(true)}
                  size="sm"
                >
                  {isCreatingRestaurant ? (
                    "Ajout en cours..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="sm:inline">Ajouter un restaurant</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-none"
                  onClick={handleJoinCompetition}
                  disabled={isJoiningCompetition}
                  size="sm"
                >
                  {isJoiningCompetition ? (
                    "Inscription..."
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      <span className="sm:inline">Rejoindre</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cartes d'informations */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
          {/* Progression */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-700 mb-2">Progression</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {progress.visitedCount}/{progress.totalCount}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div
                className="h-2.5 rounded-full bg-amber-600"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">Restaurants visités</p>
          </div>

          {/* Période */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-700 mb-2">Période</h3>
            <div className="text-md sm:text-lg font-semibold mb-1">
              {formatDate(competition.start_date)} -{" "}
              {formatDate(competition.end_date)}
            </div>
            <p className="text-sm text-gray-500">Durée de la compétition</p>
          </div>

          {/* Participants */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-700 mb-2">Participants</h3>
            <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
              {competition.participant_count}
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              {competition.participants &&
                competition.participants.slice(0, 5).map((participant, i) => (
                  <Avatar
                    key={i}
                    className="h-7 w-7 rounded-full border-2 border-white"
                  >
                    <AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
                      {participant.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4 sm:mb-6">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowDescription(!showDescription)}
          >
            <h3 className="text-lg font-bold">Description</h3>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                showDescription ? "rotate-180" : ""
              }`}
            />
          </div>
          {showDescription && (
            <p className="text-gray-700 mt-2">{competition.description}</p>
          )}
        </div>

        {/* Onglets */}
        <Tabs defaultValue="restaurants" className="w-full">
          <div className="mb-4">
            <TabsList className="bg-white border border-gray-200 rounded-md w-full">
              <TabsTrigger
                value="restaurants"
                className="flex-1 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Restaurants
              </TabsTrigger>
              <TabsTrigger
                value="ranking"
                className="flex-1 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Classement
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="restaurants" className="mt-0">
            {/* Contrôles de filtre */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpcoming(!showUpcoming)}
                className={`flex-1 sm:flex-none text-xs sm:text-sm ${
                  showUpcoming
                    ? "bg-amber-50 border-amber-600 text-amber-600"
                    : ""
                }`}
              >
                <Calendar className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">
                  {showUpcoming ? "Tous" : "À venir"}
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-200 hover:bg-amber-50 flex-1 sm:flex-none text-xs sm:text-sm"
                  >
                    <Filter className="h-4 w-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="truncate">Trier</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options de tri</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setSortOption("default")}>
                      Par défaut
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("date-asc")}>
                      <SortAsc className="h-4 w-4 mr-2" />
                      Date (croissant)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortOption("date-desc")}
                    >
                      <SortDesc className="h-4 w-4 mr-2" />
                      Date (décroissant)
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Liste des restaurants */}
            {getFilteredAndSortedRestaurants.length > 0 ? (
              getFilteredAndSortedRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white mb-3 p-4 rounded-lg shadow-sm"
                >
                  {/* En-tête du restaurant avec statut */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="mb-2 sm:mb-0">
                      <h3 className="text-lg font-bold text-gray-900 break-words pr-2">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {restaurant.address}
                        </span>
                      </div>
                    </div>
                    <div className="sm:flex-shrink-0">
                      {isRestaurantVisited(restaurant) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-green-50 text-green-800 text-xs font-medium">
                          Visité et évalué
                        </span>
                      ) : isRestaurantUpcoming(restaurant) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-800 text-xs font-medium">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatVisitDate(restaurant.visit_date)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs font-medium">
                          <Star className="h-3 w-3 mr-1" />
                          En attente d'évaluation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div className="h-px w-full bg-gray-100 my-3 block sm:hidden"></div>

                  {/* Informations et actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {restaurant.suggested_by?.username?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Proposé par</span>{" "}
                        {restaurant.suggested_by?.username || "Non spécifié"}
                      </p>
                    </div>
                    {isParticipant && canRateRestaurant(restaurant) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-amber-200 hover:bg-amber-50 text-xs w-full sm:w-auto"
                        onClick={() => handleOpenRatingModal(restaurant)}
                      >
                        <Star className="h-3 w-3 mr-1 sm:mr-2" />
                        {user && hasUserRated(restaurant)
                          ? "Modifier ma note"
                          : "Noter ce restaurant"}
                      </Button>
                    )}
                    {isParticipant && !canRateRestaurant(restaurant) && (
                      <span className="text-xs text-gray-500">
                        {competition?.status === "completed"
                          ? "La compétition est terminée"
                          : "Disponible après la date de visite"}
                      </span>
                    )}
                  </div>

                  {/* Version accordéon pour les évaluations sur mobile */}
                  {restaurantRatings[restaurant.id]?.length > 0 && (
                    <div className="mt-4 pt-2 border-t border-gray-100">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="ratings" className="border-none">
                          <AccordionTrigger className="py-2 px-0 hover:no-underline">
                            <span className="text-sm font-medium flex items-center">
                              <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 mr-2 text-xs">
                                {restaurantRatings[restaurant.id].length}
                              </span>
                              Évaluation
                              {restaurantRatings[restaurant.id].length > 1
                                ? "s"
                                : ""}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                              {restaurantRatings[restaurant.id].map(
                                (rating, index) => (
                                  <div
                                    key={index}
                                    className="p-3 bg-gray-50 rounded-md"
                                  >
                                    <div className="flex items-center mb-2">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarFallback className="text-xs">
                                          {rating.user?.username?.charAt(0) ||
                                            "?"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="font-medium text-sm flex-1">
                                        {rating.user?.username ||
                                          "Utilisateur inconnu"}
                                      </span>
                                      <span className="ml-auto font-bold text-amber-600 text-sm flex items-center">
                                        {rating.overall_score}
                                        <span className="text-gray-400 text-xs ml-0.5">
                                          /10
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex justify-between mb-1">
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="w-16">Nourriture</span>
                                        <span className="font-medium">
                                          {rating.food_score}/10
                                        </span>
                                      </div>
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="w-16">Service</span>
                                        <span className="font-medium">
                                          {rating.service_score}/10
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="w-16">Ambiance</span>
                                        <span className="font-medium">
                                          {rating.ambiance_score}/10
                                        </span>
                                      </div>
                                      <div className="flex items-center text-xs text-gray-600">
                                        <span className="w-16">Rapport</span>
                                        <span className="font-medium">
                                          {rating.value_score}/10
                                        </span>
                                      </div>
                                    </div>
                                    {rating.comment && (
                                      <p className="text-gray-700 text-xs border-t border-gray-200 pt-2 mt-2">
                                        {rating.comment}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm border border-amber-200">
                <p className="text-gray-500 px-4">
                  {showUpcoming
                    ? "Aucun restaurant à venir n'est programmé."
                    : "Aucun restaurant n'a encore été ajouté à cette compétition."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ranking" className="mt-0">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold mb-4">
                Classement des participants
              </h3>

              {/* Version mobile du tableau de classement */}
              <div className="block sm:hidden space-y-3">
                {participantRankings.length > 0 ? (
                  participantRankings.map((ranking, index) => (
                    <div
                      key={ranking.user.id}
                      className={`flex items-center p-3 rounded-md ${
                        index === 0 ? "bg-amber-50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex-shrink-0 w-8 text-center font-bold">
                        {index + 1}
                        {index === 0 && (
                          <Trophy className="h-4 w-4 text-amber-600 mx-auto mt-1" />
                        )}
                      </div>

                      <div className="flex items-center ml-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarFallback>
                            {ranking.user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium">
                          {ranking.user.username}
                        </div>
                      </div>

                      <div className="ml-auto">
                        {ranking.averageScore > 0 ? (
                          <div className="flex items-center">
                            <span className="font-bold text-amber-600">
                              {ranking.averageScore}
                            </span>
                            <span className="text-gray-500 text-sm">/10</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            Pas encore de note
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    {competition?.participants &&
                    competition.participants.length > 0
                      ? "Aucun restaurant n'a encore été évalué."
                      : "Pas encore de participants dans cette compétition."}
                  </div>
                )}
              </div>

              {/* Version desktop du tableau */}
              <div className="hidden sm:block overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider"
                      >
                        Position
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider"
                      >
                        Participant
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-amber-700 uppercase tracking-wider"
                      >
                        Score moyen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participantRankings.length > 0 ? (
                      participantRankings.map((ranking, index) => (
                        <tr
                          key={ranking.user.id}
                          className={
                            index === 0 ? "bg-amber-50" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                            {index === 0 && (
                              <span className="ml-2 text-amber-600">
                                <Trophy className="h-4 w-4 inline" />
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback>
                                  {ranking.user.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium text-gray-900">
                                {ranking.user.username}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {ranking.averageScore > 0 ? (
                              <div className="flex items-center">
                                <span className="font-bold text-amber-600">
                                  {ranking.averageScore}
                                </span>
                                <span className="text-gray-500">/10</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                Pas encore de note
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          {competition?.participants &&
                          competition.participants.length > 0
                            ? "Aucun restaurant n'a encore été évalué."
                            : "Pas encore de participants dans cette compétition."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal d'ajout de restaurant */}
      {competition && (
        <NewRestaurantModal
          isOpen={isRestaurantModalOpen}
          onClose={() => setIsRestaurantModalOpen(false)}
          onCreateRestaurant={handleCreateRestaurant}
          competitionId={competition.id}
        />
      )}

      {selectedRestaurant && (
        <RatingRestaurantModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedRestaurant(null);
            setExistingRating(null);
          }}
          onSubmitRating={handleSubmitRating}
          restaurant={selectedRestaurant}
          existingRating={existingRating}
        />
      )}
    </div>
  );
};

export default CompetitionDetailPage;
