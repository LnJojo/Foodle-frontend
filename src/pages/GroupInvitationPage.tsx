import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { groupService } from "@/api/api";
import { useAuth } from "@/contexts/AuthContext";

const GroupInvitationPage = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Vérifier l'état de l'authentification et rediriger si nécessaire
  useEffect(() => {
    if (authLoading) return; // Attendre que le statut d'authentification soit déterminé

    if (!isAuthenticated) {
      // Stocker l'ID d'invitation dans sessionStorage pour le récupérer après la connexion
      if (invitationId) {
        sessionStorage.setItem("pendingInvitation", invitationId);
      }

      // Rediriger vers la page de connexion avec le chemin actuel comme destination de redirection
      const currentPath = window.location.pathname;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    } else {
      // L'utilisateur est connecté, vérifier l'invitation
      checkInvitation();
    }
  }, [isAuthenticated, authLoading, invitationId, navigate]);

  // Vérifier si l'invitation est valide
  const checkInvitation = async () => {
    if (!invitationId) return;

    try {
      setLoading(true);
      const response = await groupService.verifyInvitation(invitationId);

      // Si l'utilisateur est déjà membre, redirigeons-le directement vers la page du groupe
      if (response.is_already_member) {
        toast.info("Vous êtes déjà membre de ce groupe");
        navigate(`/groups/${response.group.id}`);
        return;
      }

      setGroupInfo(response);
      setLoading(false);
    } catch (error: any) {
      setError(
        error.response?.data?.detail || "Invitation invalide ou expirée"
      );
      setLoading(false);
    }
  };

  // Rejoindre le groupe avec l'invitation
  const handleJoinGroup = async () => {
    if (!invitationId || !isAuthenticated) return;

    try {
      setJoining(true);
      const response = await groupService.joinWithInvitation(invitationId);
      toast.success("Vous avez rejoint le groupe avec succès!");

      // Supprimer l'invitation en attente du sessionStorage
      sessionStorage.removeItem("pendingInvitation");

      // Rediriger vers la page du groupe
      navigate(`/groups/${response.group.id}`);
    } catch (error: any) {
      console.error("Erreur lors de la tentative de rejoindre:", error);
      setError(
        error.response?.data?.detail || "Impossible de rejoindre le groupe"
      );
      toast.error("Échec lors de la tentative de rejoindre le groupe");
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-6">
          <Users className="h-12 w-12 mx-auto text-amber-600 mb-4" />
          <h1 className="text-2xl font-bold">
            Invitation à rejoindre un groupe
          </h1>

          {error ? (
            <p className="mt-4 text-red-600">{error}</p>
          ) : groupInfo ? (
            <div className="mt-4">
              <p className="font-medium text-gray-900 mb-2">
                Vous êtes invité à rejoindre:
              </p>
              <p className="text-xl font-bold text-amber-600 mb-4">
                {groupInfo.group?.name}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                {groupInfo.group?.description}
              </p>
            </div>
          ) : null}
        </div>

        {groupInfo && !error && (
          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={handleJoinGroup}
            disabled={joining}
          >
            {joining ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                Traitement...
              </>
            ) : (
              "Rejoindre le groupe"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroupInvitationPage;
