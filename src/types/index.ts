export interface User {
    id: number;
    pk?: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    avatar?: string;
  }
  
  export interface Group {
    id: number;
    name: string;
    description: string;
    creator: User;
    member_count: number;  // Utilisez ces noms pour correspondre exactement à la réponse de l'API
    competition_count: number;
    is_favorite?: boolean; // Si vous implémentez cette fonctionnalité
    created_at: string;
    members?: GroupMember[];
  }

  export interface GroupMember {
    id: number;
    user: User;
    group: number;
    role: 'admin' | 'member';
    joined_at: string;
    is_current_user?: boolean; // Optionnel - utile pour le frontend
  }
  
  export interface Competition {
    participants: User[];
    id: number;
    name: string;
    description: string;
    creator: User;
    group: number;
    group_name : string;
    start_date: string;
    end_date: string;
    status: 'planning' | 'active' | 'completed';
    participant_count: number;
    created_at: string;
    updated_at : string;
    restaurants: Restaurant[];
  }
  
  export interface Restaurant {
    id: number;
    name: string;
    address: string;
    cuisine_type: string;
    suggested_by: User;
    visit_date: string;
    image?: string | null;
    average_rating: number;
    created_at: string;
    ratings : Rating[];
  }
  
  export interface Rating {
    id: number;
    restaurant: number;
    user: User;
    food_score: number;
    service_score: number;
    ambiance_score: number;
    value_score: number;
    comment?: string;
    overall_score: number;
    created_at: string;
  }
  
  // Types pour les formulaires et les API
  export interface LoginRequest {
    username?: string;
    email?: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
  }
  
  export interface CreateGroupRequest {
    name: string;
    description: string;
  }
  
  export interface CreateCompetitionRequest {
    name: string;
    description: string;
    group: number;
    start_date: string;
    end_date: string;
  }
  
  export interface CreateRestaurantRequest {
    name: string;
    address: string;
    cuisine_type: string;
    competition: number;
    visit_date: string;
    image?: File;
  }
  
  export interface CreateRatingRequest {
    restaurant: number;
    food_score: number;
    service_score: number;
    ambiance_score: number;
    value_score: number;
    comment?: string;
  }