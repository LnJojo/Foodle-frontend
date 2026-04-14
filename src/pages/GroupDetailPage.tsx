import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart, Users, Trophy, Map, Plus, ClipboardCopy,
  Pencil, UserMinus, ShieldCheck, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CompetitionCard from "@/components/CompetitionCard";
import Navbar from "@/components/Navbar";
import { competitionService, groupService } from "@/api/api";
import { Competition, Group, GroupMember } from "@/types";
import NewCompetitionModal from "@/components/NewCompetitionModal";
import { useAuth } from "@/contexts/AuthContext";

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
  useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [isNewCompetitionModalOpen, setIsNewCompetitionModalOpen] = useState(false);
  const [isCreatingCompetition, setIsCreatingCompetition] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // État de la modal d'édition du groupe
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSavingGroup, setIsSavingGroup] = useState(false);

  // État de la confirmation d'exclusion
  const [kickConfirmMember, setKickConfirmMember] = useState<GroupMember | null>(null);
  const [isKicking, setIsKicking] = useState(false);

  // Rôle de l'utilisateur courant dans ce groupe (via is_current_user retourné par le backend)
  const currentUserIsAdmin = members.some(
    (m) => m.is_current_user === true && m.role === "admin"
  );

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [groupData, groupMember, competitionsData] = await Promise.all([
        groupService.getGroup(Number(id)),
        groupService.getGroupMembers(Number(id)),
        competitionService.getCompetitions(Number(id)),
      ]);
      setGroup(groupData);
      setMembers(groupMember);
      setCompetitions(competitionsData);
      setIsFavorite(groupData.is_favorite || false);
    } catch {
      toast.error("Erreur lors du chargement des données du groupe");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Création de compétition ──────────────────────────────────────────────
  const handleCreateCompetition = async (competitionData: NewCompetitionData) => {
    setIsCreatingCompetition(true);
    try {
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
      const toastId = toast.loading(`Création de la compétition "${competitionData.name}" en cours...`);
      const newCompetition = await competitionService.createCompetition(formattedData);
      toast.dismiss(toastId);
      toast.success(`La compétition "${competitionData.name}" a été créée avec succès.`);
      setCompetitions((prev) => [
        ...prev,
        { ...newCompetition, group_name: group?.name || "Groupe actuel" },
      ]);
      setTimeout(() => navigate(`/competitions/${newCompetition.id}`), 500);
    } catch (error) {
      toast.error(`Erreur: ${(error as Error).message || "Création impossible"}`);
      return Promise.reject(error);
    } finally {
      setIsCreatingCompetition(false);
    }
  };

  // ── Lien d'invitation ────────────────────────────────────────────────────
  const generateInvitationLink = async () => {
    setIsGeneratingLink(true);
    try {
      const data = await groupService.createInvitation(Number(id));
      const invitationUrl = `${window.location.origin}/invite/${data.id}`;
      setInvitationLink(invitationUrl);
      toast.success("Lien d'invitation généré avec succès !");
    } catch {
      toast.error("Erreur lors de la génération du lien d'invitation");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyShareLink = () => {
    const linkToCopy = invitationLink || `${window.location.origin}/group/${id}`;
    navigator.clipboard.writeText(linkToCopy);
    toast.success("Lien copié !");
  };

  // ── Favoris ──────────────────────────────────────────────────────────────
  const toggleFavorite = async () => {
    setIsFavorite((prev) => !prev);
    try {
      await groupService.toggleFavorite(Number(id));
      toast.success(!isFavorite ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch {
      setIsFavorite((prev) => !prev);
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  };

  // ── Édition du groupe ────────────────────────────────────────────────────
  const openEditModal = () => {
    setEditName(group?.name || "");
    setEditDescription(group?.description || "");
    setEditModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!editName.trim()) {
      toast.error("Le nom du groupe ne peut pas être vide");
      return;
    }
    setIsSavingGroup(true);
    try {
      const updated = await groupService.patchGroup(Number(id), {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setGroup(updated);
      setEditModalOpen(false);
      toast.success("Groupe mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour du groupe");
    } finally {
      setIsSavingGroup(false);
    }
  };

  // ── Exclusion d'un membre ────────────────────────────────────────────────
  const handleKickMember = async () => {
    if (!kickConfirmMember) return;
    setIsKicking(true);
    try {
      await groupService.removeMember(kickConfirmMember.id);
      setMembers((prev) => prev.filter((m) => m.id !== kickConfirmMember.id));
      toast.success(`${kickConfirmMember.user.username} a été exclu du groupe`);
      setKickConfirmMember(null);
    } catch {
      toast.error("Erreur lors de l'exclusion du membre");
    } finally {
      setIsKicking(false);
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
      <Navbar />

      <div className="min-w-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête du groupe */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between md:items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold truncate">{group?.name}</h1>
                <div className="flex items-center gap-1 shrink-0">
                  {currentUserIsAdmin && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={openEditModal}
                      title="Modifier le groupe"
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4 text-gray-400 hover:text-amber-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={toggleFavorite} className="h-8 w-8">
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite ? "fill-amber-600 text-amber-600" : "text-gray-400"
                      }`}
                    />
                  </Button>
                </div>
              </div>
              <div className="flex items-center text-gray-600 mb-3">
                <Users className="h-4 w-4 mr-2 shrink-0" />
                <span>{group?.member_count} membres</span>
              </div>
              <p className="text-gray-600">{group?.description}</p>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-52">
              {currentUserIsAdmin && (
                <>
                  {!invitationLink ? (
                    <Button
                      variant="outline"
                      className="border-gray-300 w-full"
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
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={invitationLink}
                        className="border rounded px-3 py-2 text-sm flex-1 min-w-0"
                        readOnly
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="shrink-0"
                        onClick={copyShareLink}
                        title="Copier le lien"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}

              <Button
                onClick={() => setIsNewCompetitionModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 w-full"
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

          {/* Onglet Compétitions */}
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
                    status={competition.status === "completed" ? "completed" : "active"}
                  />
                ))}
                <div
                  className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setIsNewCompetitionModalOpen(true)}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Plus className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Créer une compétition</h3>
                  <p className="text-sm text-center">Lancez une nouvelle compétition dans ce groupe</p>
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

          {/* Onglet Membres */}
          <TabsContent value="members">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-1">Membres du groupe</h2>
              <p className="text-gray-500 text-sm mb-6">
                {members.length} participant{members.length > 1 ? "s" : ""} dans {group?.name}
              </p>

              {members.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {members.map((member) => {
                    const isSelf = member.is_current_user === true;
                    const isAdmin = member.role === "admin";
                    const isCreator = group?.creator.id === member.user.id;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      >
                        {/* Infos membre */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <span className="text-amber-700 font-semibold text-sm">
                              {member.user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {member.user.username}
                              {isSelf && (
                                <span className="ml-1 text-xs text-gray-400">(vous)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              Membre depuis{" "}
                              {new Date(member.joined_at).toLocaleDateString("fr-FR", {
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Badges + actions */}
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {isCreator && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Créateur
                            </span>
                          )}
                          {isAdmin && !isCreator && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </span>
                          )}
                          {isAdmin && !isCreator && (
                            <ShieldCheck className="sm:hidden h-4 w-4 text-amber-600" />
                          )}

                          {/* Actions admin : promouvoir + exclure (jamais sur le créateur) */}
                          {currentUserIsAdmin && !isSelf && !isCreator && (
                            <div className="flex items-center gap-1">
                              {!isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-400 hover:text-amber-600"
                                  title="Promouvoir admin"
                                  onClick={async () => {
                                    try {
                                      await groupService.updateMemberRole(member.id, "admin");
                                      setMembers((prev) =>
                                        prev.map((m) =>
                                          m.id === member.id ? { ...m, role: "admin" } : m
                                        )
                                      );
                                      toast.success(`${member.user.username} est maintenant admin`);
                                    } catch {
                                      toast.error("Erreur lors de la promotion");
                                    }
                                  }}
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600"
                                title="Exclure du groupe"
                                onClick={() => setKickConfirmMember(member)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-md text-gray-500">
                  Aucun membre dans ce groupe pour le moment
                </div>
              )}
            </div>
          </TabsContent>

          {/* Onglet Carte */}
          <TabsContent value="map">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Carte</h2>
              <div className="bg-gray-300 rounded-lg border p-10">
                <p className="flex justify-center">La map arrivera prochainement.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modal édition du groupe ──────────────────────────────────────── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le groupe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nom du groupe</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nom du groupe"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Décrivez votre groupe…"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              disabled={isSavingGroup}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveGroup}
              disabled={isSavingGroup}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSavingGroup ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal confirmation exclusion ─────────────────────────────────── */}
      <Dialog
        open={kickConfirmMember !== null}
        onOpenChange={(open) => { if (!open) setKickConfirmMember(null); }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Exclure un membre</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Voulez-vous vraiment exclure{" "}
            <span className="font-semibold">{kickConfirmMember?.user.username}</span> du groupe ?
            Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setKickConfirmMember(null)}
              disabled={isKicking}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleKickMember}
              disabled={isKicking}
            >
              {isKicking ? "Exclusion…" : "Exclure"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewCompetitionModal
        isOpen={isNewCompetitionModalOpen}
        onClose={() => setIsNewCompetitionModalOpen(false)}
        onCreateCompetition={handleCreateCompetition}
        userGroups={group ? [group] : undefined}
        preselectedGroupId={id}
        preselectedGroupName={group?.name}
      />
    </div>
  );
};

export default GroupDetailPage;
