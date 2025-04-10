import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Users, Trophy, Map, Plus, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import CompetitionCard from "@/components/CompetitionCard";
import Navbar from "@/components/Navbar";
import { competitionService, groupService } from "@/api/api";
import { Competition, Group, GroupMember } from "@/types";
import NewCompetitionModal from "@/components/NewCompetitionModal";

interface NewCompetitionData {
  name: string;
  group: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  theme?: string;
}

const GroupDetailPage = () => {
  useEffect(() => {
    document.title = "Groupe | Foodle";
  }, []);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [isNewCompetitionModalOpen, setIsNewCompetitionModalOpen] =
    useState<boolean>(false);
  const [isCreatingCompetition, setIsCreatingCompetition] =
    useState<boolean>(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState<boolean>(false);

  // Récupération de toutes les données du groupe
  const fetchData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Utilisation de Promise.all pour paralléliser les requêtes
      const [groupData, groupMember, competitionsData] = await Promise.all([
        groupService.getGroup(Number(id)),
        groupService.getGroupMembers(Number(id)),
        competitionService.getCompetitions(Number(id)),
      ]);

      setGroup(groupData);
      setMembers(groupMember);
      setCompetitions(competitionsData);
      setIsFavorite(groupData.is_favorite || false);
    } catch (error) {
      toast.error("Erreur lors du chargement des données du groupe");
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

      const newCompetition = await competitionService.createCompetition(
        formattedData
      );

      // Remplacer le toast "en cours" par un toast de succès
      toast.dismiss(toastId);
      toast.success(
        `La compétition "${competitionData.name}" a été créée avec succès.`
      );

      // Ajouter la nouvelle compétition à la liste avant de naviguer
      // Cela permet d'éviter un clignotement lors de la navigation
      setCompetitions((prev) => [
        ...prev,
        {
          ...newCompetition,
          group_name: group?.name || "Groupe actuel",
        },
      ]);

      // Utiliser un petit délai avant de naviguer pour permettre à l'utilisateur de voir le toast de succès
      setTimeout(() => {
        navigate(`/competitions/${newCompetition.id}`);
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la création de la compétition:", error);
      toast.error(
        `Erreur: ${
          (error as Error).message || "Création de compétition impossible"
        }`
      );
      return Promise.reject(error);
    } finally {
      setIsCreatingCompetition(false);
    }
  };

  const generateInvitationLink = async () => {
    setIsGeneratingLink(true);
    try {
      const data = await groupService.createInvitation(Number(id));
      // Construire l'URL complète côté frontend avec le bon port
      const invitationUrl = `${window.location.origin}/invite/${data.id}`;
      setInvitationLink(invitationUrl);
      toast.success("Lien d'invitation généré avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la génération du lien d'invitation");
      console.error("Erreur d'invitation:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyShareLink = () => {
    const linkToCopy =
      invitationLink || `${window.location.origin}/group/${id}`;
    navigator.clipboard.writeText(linkToCopy);
    toast.success("Lien copié !");
  };

  const toggleFavorite = async () => {
    // Optimistic UI update - mettre à jour l'UI immédiatement
    setIsFavorite((prevState) => !prevState);

    try {
      await groupService.toggleFavorite(Number(id));
      toast.success(!isFavorite ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setIsFavorite((prevState) => !prevState);
      toast.error("Erreur lors de la mise à jour des favoris");
      console.error("Erreur favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Navbar identique au dashboard */}
      <Navbar />

      {/* Contenu principal */}
      <div className="min-w-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête du groupe */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{group?.name}</h1>
                <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite
                        ? "fill-amber-600 text-amber-600"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <Users className="h-4 w-4 mr-2" />
                <span>{group?.member_count} membres</span>
              </div>
              <p className="text-gray-600">{group?.description}</p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              {!invitationLink ? (
                <Button
                  variant="outline"
                  className="border-gray-300 w-full sm:w-auto"
                  onClick={generateInvitationLink}
                  disabled={isGeneratingLink}
                >
                  {isGeneratingLink ? (
                    "Génération en cours..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Générer un lien d'invitation
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                  <input
                    type="text"
                    value={invitationLink}
                    className="border rounded px-3 py-2 text-sm w-full"
                    readOnly
                  />
                  <Button
                    variant="secondary"
                    className="shrink-0 transition hover:bg-gray-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onClick={copyShareLink}
                  >
                    <ClipboardCopy className="h-4 w-4 mr-1" />
                    Copier
                  </Button>
                </div>
              )}

              <Button
                onClick={() => setIsNewCompetitionModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                disabled={isCreatingCompetition}
              >
                {isCreatingCompetition ? (
                  "Création en cours..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle compétition
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="competitions" className="w-full mb-6">
          <TabsList className="bg-white border border-gray-200 rounded-md">
            <TabsTrigger
              value="competitions"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Compétitions
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <Users className="h-4 w-4 mr-2" />
              Membres
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600"
            >
              <Map className="h-4 w-4 mr-2" />
              Carte
            </TabsTrigger>
          </TabsList>
          <TabsContent value="competitions" className="mt-6">
            {competitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitions.map((competition) => (
                  <CompetitionCard
                    key={competition.id}
                    id={competition.id}
                    title={competition.name}
                    group={competition.group_name}
                    participants={competition.participant_count}
                    endDate={competition.end_date}
                    status={
                      competition.status === "completed"
                        ? "completed"
                        : "active"
                    }
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
                    Lancez une nouvelle compétition dans ce groupe
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-md text-gray-500">
                <p>Aucune compétition dans ce groupe pour le moment</p>
                <Button
                  className="mt-4 bg-amber-600 hover:bg-amber-700"
                  onClick={() => setIsNewCompetitionModalOpen(true)}
                  disabled={isCreatingCompetition}
                >
                  {isCreatingCompetition ? (
                    "Création en cours..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer ma première compétition
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="members">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Membres du groupe</h2>
              <p className="text-gray-600 mb-6">
                Liste des participants du groupe {group?.name}
              </p>

              {members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{member.user.username}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      {member.role === "admin" && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md text-gray-500">
                  Aucun membre dans ce groupe pour le moment
                </div>
              )}

              <Button variant="outline" className="w-full mt-6 border-gray-300">
                <Plus className="mr-2 h-4 w-4" />
                Inviter des membres
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="map">
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex-row justify-center">
              <h2 className="text-xl font-semibold mb-4">Carte</h2>
              <div className="bg-gray-300 rounded-lg border p-10">
                <p className="flex justify-center">
                  La map arrivera prochainement.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <NewCompetitionModal
          isOpen={isNewCompetitionModalOpen}
          onClose={() => setIsNewCompetitionModalOpen(false)}
          onCreateCompetition={handleCreateCompetition}
          userGroups={group ? [group] : undefined}
        />
      </div>
    </div>
  );
};

export default GroupDetailPage;
