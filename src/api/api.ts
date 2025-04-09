import axios from 'axios';
import { 
  User, Group, Competition, Restaurant, Rating,
  LoginRequest, RegisterRequest, CreateGroupRequest,
  CreateCompetitionRequest, CreateRestaurantRequest, CreateRatingRequest
} from '../types';

// Créer une instance axios avec la configuration de base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ou l'endroit où vous stockez votre token
    if (token) {
      config.headers.Authorization = `Token ${token}`; // ou `Bearer ${token}` selon votre backend
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Services d'authentification
export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post('auth/login/', data);
    return response.data;
  },
  register: async (data: RegisterRequest) => {
    const payload = {
      username: data.username,
      email: data.email,
      password1: data.password,        
      password2: data.password_confirm  
    };
    const response = await api.post('auth/registration/', payload);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('auth/logout/');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('auth/user/');
    return response.data as User;
  },
};

// Services pour les groupes
export const groupService = {
  getGroups: async () => {
    const response = await api.get('groups/');
    console.log('API response:', response.data);
    return response.data as Group[];
  },
  getGroup: async (id: number) => {
    const response = await api.get(`groups/${id}/`);
    console.log("API Response : ", response);
    return response.data as Group;
  },
  getGroupMembers: async (groupId: number) => {
    const response = await api.get(`groups/${groupId}/members/`);
    return response.data as Array<{
      id: number;
      user: User;
      group: number;
      role: 'admin' | 'member';
      joined_at: string;
      is_current_user: boolean;
    }>;
  },
  updateMemberRole: async (groupId: number, userId: number, role: 'admin' | 'member') => {
    const response = await api.patch(`groups/${groupId}/members/${userId}/`, { role });
    return response.data;
  },
  
  removeMember: async (groupId: number, userId: number) => {
    const response = await api.delete(`groups/${groupId}/members/${userId}/`);
    return response.data;
  },
  getGroupCompetitions: async (id: number) => {
    const response = await api.get(`competitions/?group=${id}`);
    return response.data;
  },
  
  toggleFavorite: async (id: number) => {
    const response = await api.post(`groups/${id}/toggle_favorite/`);
    return response.data;
  },

  createGroup: async (data: {
    name: string;
    description: string;
    privacy: string;
  }) => {
    const response = await api.post('groups/create_group/', data);
    return response.data;
  },
  updateGroup: async (id: number, data: Partial<CreateGroupRequest>) => {
    const response = await api.put(`groups/${id}/`, data);
    return response.data as Group;
  },
  deleteGroup: async (id: number) => {
    const response = await api.delete(`groups/${id}/`);
    return response.data;
  },
  createInvitation: async (groupId: number) => {
    try {
      const response = await api.post(`groups/${groupId}/create_invitation/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du lien d'invitation:", error);
      throw error;
    }
  },
  verifyInvitation: async (invitationId: string) => {
    try {
      const response = await api.get(`groups/invitations/${invitationId}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'invitation:", error);
      throw error;
    }
  },
  joinWithInvitation: async (invitationId: string) => {
    try {
      const response = await api.post(`groups/join/${invitationId}/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la tentative de rejoindre le groupe:", error);
      throw error;
    }
  },
};

// Services pour les compétitions
export const competitionService = {
  getCompetitions: async (groupId?: number) => {
    const url = groupId ? `competitions/?group=${groupId}` : 'competitions/';
    const response = await api.get(url);
    return response.data as Competition[];
  },
  getCompetition: async (id: number) => {
    try {
      const response = await api.get(`competitions/${id}/`);
      console.log("Réponse API détail compétition:", response.data);
      return response.data as Competition;
    } catch (error) {
      console.error("Erreur lors de la récupération de la compétition:", error);
      throw error;
    }
  },
  getCompetitionParticipants: async (id: number) => {
    const response = await api.get(`competitions/${id}/participants/`);
    return response.data;
  },
  createCompetition: async (data: {
    name: string;
    group: number;
    description: string;
    start_date: string;
    end_date: string;
  }) => {
    try {
      // Crée la compétition
      const response = await api.post('competitions/create_competition/', data);
      const newCompetition = response.data;
      
      // Le créateur rejoint automatiquement la compétition côté backend
      // Mais pour s'assurer que tout fonctionne, on peut également appeler explicitement joinCompetition
      try {
        await api.post(`competitions/${newCompetition.id}/join/`);
        console.log("Le créateur a rejoint automatiquement la compétition");
      } catch (joinError) {
        // Si l'erreur est due au fait que l'utilisateur est déjà participant, c'est OK
        console.log("Remarque: le créateur est peut-être déjà participant:", joinError);
      }
      
      return newCompetition;
    } catch (error) {
      console.error("Erreur lors de la création de la compétition:", error);
      throw error;
    }
  },
  updateCompetition: async (id: number, data: Partial<CreateCompetitionRequest>) => {
    try {
      console.log(`Mise à jour de la compétition ${id} avec les données:`, data);
      const response = await api.patch(`competitions/${id}/`, data);
      return response.data as Competition;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la compétition:", error);
      throw error;
    }
  },
  deleteCompetition: async (id: number) => {
    const response = await api.delete(`competitions/${id}/`);
    return response.data;
  },
  joinCompetition: async (id: number) => {
    try {
      const response = await api.post(`competitions/${id}/join/`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la tentative de rejoindre la compétition:", error);
      throw error;
    }
  },
};

// Services pour les restaurants
export const restaurantService = {
  getRestaurants: async (competitionId?: number) => {
    const url = competitionId ? `restaurants/?competition=${competitionId}` : 'restaurants/';
    const response = await api.get(url);
    return response.data as Restaurant[];
  },
  getRestaurant: async (id: number) => {
    const response = await api.get(`restaurants/${id}/`);
    return response.data as Restaurant;
  },
  createRestaurant: async (data: CreateRestaurantRequest) => {
    // Pour l'upload d'images, on utilise FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await api.post('restaurants/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as Restaurant;
  },
  updateRestaurant: async (id: number, data: Partial<CreateRestaurantRequest>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, typeof value === 'number' ? value.toString() : value);
      }
    });
    
    const response = await api.put(`restaurants/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as Restaurant;
  },
  deleteRestaurant: async (id: number) => {
    const response = await api.delete(`restaurants/${id}/`);
    return response.data;
  },
};

// Services pour les évaluations
export const ratingService = {
  getRatings: async (restaurantId?: number) => {
    const url = restaurantId ? `ratings/?restaurant=${restaurantId}` : 'ratings/';
    const response = await api.get(url);
    return response.data as Rating[];
  },
  getRating: async (id: number) => {
    const response = await api.get(`ratings/${id}/`);
    return response.data as Rating;
  },
  createRating: async (data: CreateRatingRequest) => {
    const response = await api.post('ratings/', data);
    return response.data as Rating;
  },
  updateRating: async (id: number, data: Partial<CreateRatingRequest>) => {
    const response = await api.put(`ratings/${id}/`, data);
    return response.data as Rating;
  },
  deleteRating: async (id: number) => {
    const response = await api.delete(`ratings/${id}/`);
    return response.data;
  },
};

export default api;