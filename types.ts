
export enum Sector {
  DESIGN = 'Design & UX',
  DEV = 'Développement',
  MARKETING = 'Marketing',
  GENERAL = 'Général',
  // Nouveaux secteurs demandés
  COORDINATION = 'Coordination',
  HR = 'Ressources',
  AUDIO = 'Audio'
}

export enum TaskStatus {
  TODO = 'À faire',
  IN_PROGRESS = 'En cours',
  REVIEW = 'En revue',
  DONE = 'Terminé'
}

export enum UserRole {
  ADMIN = 'Admin',
  MEMBER = 'Membre',
  VISITOR = 'Visiteur'
}

export interface User {
  id: string;
  name: string;
  email?: string; // Nouveau champ pour l'auth
  password?: string; // Nouveau champ pour la simulation d'auth locale
  avatar: string;
  role: string; // Titre du poste (ex: Designer)
  systemRole: UserRole; // Rôle technique (ex: Admin)
  sector?: Sector; // Secteur de rattachement
}

export interface TaskActivity {
  id: string;
  userId: string;
  type: 'comment' | 'status_change' | 'creation' | 'upload' | 'edit';
  content: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: User;
  deadline: string;
  status: TaskStatus;
  sector: Sector;
  description: string;
  history: TaskActivity[];
  // Nouveaux champs stratégiques
  impactScore?: number; // 0 à 100
  effortScore?: number; // 1 à 10
  strategicTheme?: string; // ex: "Revenus", "UX", "Tech Debt"
  aiRationale?: string; // Justification courte de l'IA
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  attendees: string[]; // User IDs
  type: 'video' | 'person';
}

export interface KPI {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface AIAnalysisResult {
  summary: string;
  risks: string[];
  nextSteps: string[];
  kpis: KPI[];
  chartData: {
    name: string;
    progress: number;
    assignee: string;
  }[];
}

export interface AnalysisHistoryItem extends AIAnalysisResult {
  date: string; // string ISO pour compatibilité JSON/LocalStorage
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  sector?: Sector;
}
