import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useGroups } from "@/hooks/useGroups";
import { useCompetitions } from "@/hooks/useCompetitions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart, Users, Trophy, Plus } from "lucide-react";
import GroupCard from "@/components/GroupCard";
import CompetitionCard from "@/components/CompetitionCard";
import NewGroupModal from "../components/NewGroupModal";
import NewCompetitionModal from "../components/NewCompetitionModal";
import Navbar from "@/components/Navbar";
import { competitionService, groupService } from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";

interface NewGroupData {
  name: string;
  description: string;
  privacy: string;
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

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] =
    useState<boolean>(false);
  const [isNewCompetitionModalOpen, setIsNewCompetitionModalOpen] =
    useState<boolean>(false);

  // États pour suivre les opérations en cours
  const [isCreatingGroup, setIsCreatingGroup] = useState<boolean>(false);
  const [isCreatingCompetition, setIsCreatingCompetition] =
    useState<boolean>(false);

  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
    refetch: refetchGroups,
  } = useGroups();

  const {
    competitions,
    loading: competitionsLoading,
    error: competitionsError,
    refetch: refetchCompetitions,
  } = useCompetitions();

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<string>("");

  const favoriteGroups = groups.filter((group) => group.is_favorite);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fonction pour recharger toutes les données nécessaires
  const refreshData = useCallback(() => {
    // Attendre un peu pour permettre au serveur de traiter les changements
    // (évite les problèmes de cache côté serveur)
    setTimeout(() => {
      refetchGroups();
      refetchCompetitions();
    }, 300);
  }, [refetchGroups, refetchCompetitions]);

  const handleCreateGroup = async (groupData: NewGroupData) => {
    setIsCreatingGroup(true);
    try {
      // Fermer la modal avant d'attendre la réponse du serveur pour une meilleure UX
      setIsNewGroupModalOpen(false);

      // Afficher un toast de "création en cours" qui sera remplacé par un toast de succès
      const toastId = toast.loading(
        `Création du groupe "${groupData.name}" en cours...`
      );

      await groupService.createGroup(groupData);

      // Remplacer le toast "en cours" par un toast de succès
      toast.dismiss(toastId);
      toast.success(`Le groupe "${groupData.name}" a été créé avec succès.`);

      // Recharger les données
      refreshData();
    } catch (error) {
      console.error("Erreur lors de la création du groupe:", error);
      toast.error(
        `Erreur lors de la création du groupe: ${
          (error as Error).message || "Erreur inconnue"
        }`
      );
      return Promise.reject(error);
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCreateCompetition = async (
    competitionData: NewCompetitionData
  ) => {
    setIsCreatingCompetition(true);
    try {
      // Fermer la modal immédiatement pour une meilleure UX
      setIsNewCompetitionModalOpen(false);

      const formattedData = {
        name: competitionData.name,
        group: Number(competitionData.group),
        description: competitionData.description,
        start_date: competitionData.startDate.toISOString().split("T")[0],
        end_date: competitionData.endDate.toISOString().split("T")[0],
        max_participants: Number(competitionData.maxParticipants),
        theme: competitionData.theme,
      };

      // Afficher un toast de "création en cours"
      const toastId = toast.loading(
        `Création de la compétition "${competitionData.name}" en cours...`
      );

      await competitionService.createCompetition(formattedData);

      // Remplacer le toast "en cours" par un toast de succès
      toast.dismiss(toastId);
      toast.success(
        `La compétition "${competitionData.name}" a été créée avec succès.`
      );

      // Recharger les données
      refreshData();
    } catch (error) {
      console.error("Erreur lors de la création de la compétition:", error);
      toast.error(
        `Erreur lors de la création de la compétition: ${
          (error as Error).message || "Erreur inconnue"
        }`
      );
      return Promise.reject(error);
    } finally {
      setIsCreatingCompetition(false);
    }
  };

  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const statusMatch = !statusFilter || comp.status === statusFilter;
      const groupMatch = !groupFilter || comp.name === groupFilter;
      return statusMatch && groupMatch;
    });
  }, [competitions, statusFilter, groupFilter]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <div>Redirection vers la page de connexion...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Barre de navigation et en-tête */}
      <Navbar />

      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Gérez vos groupes et compétitions
          </h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsNewGroupModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-auto"
              disabled={isCreatingGroup}
            >
              {isCreatingGroup ? (
                <span>Création...</span>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouveau groupe</span>
                  <span className="sm:hidden">Groupe</span>
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsNewCompetitionModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 flex-1 sm:flex-auto"
              disabled={isCreatingCompetition || groups.length === 0}
            >
              {isCreatingCompetition ? (
                <span>Création...</span>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nouvelle compétition</span>
                  <span className="sm:hidden">Compétition</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="bg-white border border-gray-200 rounded-md">
            <TabsTrigger
              value="groups"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <Users className="h-4 w-4 mr-2" />
              Mes groupes
            </TabsTrigger>
            <TabsTrigger
              value="competitions"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Mes compétitions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-6">
            {/* Contenu de l'onglet groupes */}

            {/* Groupes favoris */}
            {groupsLoading ? (
              <div className="text-center py-10">Chargement des groupes...</div>
            ) : groupsError ? (
              <div className="text-center py-10 text-red-500">
                {groupsError}
              </div>
            ) : (
              <>
                {/* Groupes favoris */}
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-amber-600 fill-amber-600" />
                      Groupes favoris
                    </h2>
                    {/* Contrôles de navigation */}
                  </div>

                  {favoriteGroups.length > 0 ? (
                    <div className="flex space-x-4 overflow-x-auto pb-4">
                      {favoriteGroups.map((group) => (
                        <GroupCard
                          id={group.id}
                          key={group.id}
                          name={group.name}
                          member_count={group.member_count}
                          competition_count={group.competition_count}
                          is_favorite={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-md text-gray-500">
                      Vous n'avez pas encore de groupes favoris
                    </div>
                  )}
                </section>

                {/* Tous mes groupes */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">
                    Tous mes groupes
                  </h2>
                  {groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groups.map((group) => (
                        <GroupCard
                          id={group.id}
                          key={group.id}
                          name={group.name}
                          member_count={group.member_count}
                          competition_count={group.competition_count}
                          is_favorite={group.is_favorite ?? false}
                        />
                      ))}

                      {/* Carte pour créer un nouveau groupe */}
                      <div
                        className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer"
                        onClick={() => setIsNewGroupModalOpen(true)}
                      >
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <Plus className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          Créer un groupe
                        </h3>
                        <p className="text-sm text-center">
                          Créez un nouveau groupe pour organiser des
                          compétitions
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-md text-gray-500">
                      Vous n'avez pas encore de groupes
                      <Button
                        className="mt-4 bg-amber-600 hover:bg-amber-700"
                        onClick={() => setIsNewGroupModalOpen(true)}
                        disabled={isCreatingGroup}
                      >
                        {isCreatingGroup ? (
                          <span>Création...</span>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer mon premier groupe
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </section>
              </>
            )}
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            {/* Filtre pour les compétitions */}
            {competitionsLoading ? (
              <div className="text-center py-10">
                Chargement des compétitions...
              </div>
            ) : competitionsError ? (
              <div className="text-center py-10 text-red-500">
                {competitionsError}
              </div>
            ) : (
              <>
                {/* Filtre pour les compétitions */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">
                    Filtrer les compétitions
                  </h2>

                  <div className="flex flex-wrap gap-4">
                    <div className="w-full sm:w-auto">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Statut
                      </p>
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full sm:w-64 px-4 py-2.5 rounded-md bg-white border border-gray-200 shadow-sm appearance-none pr-10 focus:outline-none"
                        >
                          <option value="">Tous les statuts</option>
                          <option value="active">En cours</option>
                          <option value="planning">À venir</option>
                          <option value="completed">Terminée</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Groupe
                      </p>
                      <div className="relative">
                        <select
                          value={groupFilter}
                          onChange={(e) => setGroupFilter(e.target.value)}
                          className="w-full sm:w-64 px-4 py-2.5 rounded-md bg-white border border-gray-200 shadow-sm appearance-none pr-10 focus:outline-none"
                        >
                          <option value="">Tous les groupes</option>
                          {groups.map((group) => (
                            <option
                              key={group.id}
                              value={group.name.toString()}
                            >
                              {group.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des compétitions */}
                {competitions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompetitions.map((competition) => (
                      <CompetitionCard
                        id={competition.id}
                        key={competition.id}
                        title={competition.name}
                        group={competition?.group_name || "Groupe inconnu"}
                        participants={competition.participant_count}
                        endDate={new Date(
                          competition.end_date
                        ).toLocaleDateString("fr-FR")}
                        status={competition.status}
                      />
                    ))}

                    {/* Carte pour créer une nouvelle compétition */}
                    <div
                      className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setIsNewCompetitionModalOpen(true)}
                    >
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Plus className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        Créer une compétition
                      </h3>
                      <p className="text-sm text-center">
                        Lancez une nouvelle compétition dans l'un de vos groupes
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-md text-gray-500">
                    <p>Vous n'avez pas encore de compétitions</p>
                    <Button
                      className="mt-4 bg-amber-600 hover:bg-amber-700"
                      onClick={() => setIsNewCompetitionModalOpen(true)}
                      disabled={groups.length === 0 || isCreatingCompetition}
                    >
                      {isCreatingCompetition ? (
                        <span>Création...</span>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          {groups.length > 0
                            ? "Créer ma première compétition"
                            : "Créez d'abord un groupe"}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        <NewGroupModal
          isOpen={isNewGroupModalOpen}
          onClose={() => setIsNewGroupModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />

        <NewCompetitionModal
          isOpen={isNewCompetitionModalOpen}
          onClose={() => setIsNewCompetitionModalOpen(false)}
          onCreateCompetition={handleCreateCompetition}
          userGroups={groups}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
