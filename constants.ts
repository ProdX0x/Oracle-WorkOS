import { Sector, TaskStatus, Task, User, Meeting } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Kiki', role: 'Team Lead', avatar: 'https://picsum.photos/id/64/100/100' },
  { id: 'u2', name: 'Stéphane', role: 'Architecte', avatar: 'https://picsum.photos/id/1005/100/100' },
  { id: 'u3', name: 'Alice', role: 'Designer', avatar: 'https://picsum.photos/id/338/100/100' },
  { id: 'u4', name: 'Bob', role: 'Dev Backend', avatar: 'https://picsum.photos/id/177/100/100' },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Maquette iOS 18 Home',
    assignee: USERS[2],
    deadline: '2023-11-15',
    status: TaskStatus.DONE,
    sector: Sector.DESIGN,
    description: 'Finaliser les effets de flou et les icônes selon les guidelines Apple Human Interface. Le but est d\'avoir une fluidité maximale sur les transitions.',
    history: [
      { id: 'h1', userId: 'u1', type: 'creation', content: 'Tâche créée', timestamp: '2023-11-01T09:00:00' },
      { id: 'h2', userId: 'u3', type: 'status_change', content: 'Passé en En cours', timestamp: '2023-11-02T10:30:00' },
      { id: 'h3', userId: 'u3', type: 'comment', content: 'Les effets de glassmorphism sont prêts.', timestamp: '2023-11-10T14:20:00' },
      { id: 'h4', userId: 'u1', type: 'status_change', content: 'Passé en Terminé', timestamp: '2023-11-14T16:00:00' }
    ]
  },
  {
    id: 't2',
    title: 'Intégration Carte 3D',
    assignee: USERS[1],
    deadline: '2023-11-20',
    status: TaskStatus.IN_PROGRESS,
    sector: Sector.DEV,
    description: 'Optimisation Three.js pour mobile. Réduire le poids des textures et implémenter le lazy loading des assets 3D.',
    history: [
      { id: 'h5', userId: 'u2', type: 'creation', content: 'Tâche créée', timestamp: '2023-11-05T11:00:00' },
      { id: 'h6', userId: 'u2', type: 'comment', content: 'J\'ai un souci de FPS sur Android, je dois revoir les shaders.', timestamp: '2023-11-18T09:15:00' }
    ]
  },
  {
    id: 't3',
    title: 'Auth System MVVM',
    assignee: USERS[3],
    deadline: '2023-11-25',
    status: TaskStatus.REVIEW,
    sector: Sector.DEV,
    description: 'Connexion sécurisée avec tokens JWT et refresh tokens. Implémentation du pattern Repository pour la gestion des utilisateurs.',
    history: [
      { id: 'h7', userId: 'u1', type: 'creation', content: 'Tâche créée', timestamp: '2023-11-08T10:00:00' },
      { id: 'h8', userId: 'u4', type: 'status_change', content: 'Passé en En revue', timestamp: '2023-11-22T15:45:00' },
      { id: 'h9', userId: 'u4', type: 'upload', content: 'a ajouté spec_auth_v2.pdf', timestamp: '2023-11-22T15:46:00' }
    ]
  },
  {
    id: 't4',
    title: 'Plan Marketing Lancement',
    assignee: USERS[0],
    deadline: '2023-12-01',
    status: TaskStatus.TODO,
    sector: Sector.MARKETING,
    description: 'Préparer les assets pour les stores (App Store & Play Store). Rédiger le communiqué de presse et préparer la campagne réseaux sociaux.',
    history: [
       { id: 'h10', userId: 'u1', type: 'creation', content: 'Tâche créée', timestamp: '2023-11-12T08:30:00' }
    ]
  },
];

export const INITIAL_MEETINGS: Meeting[] = [
  { id: 'm1', title: 'Sprint Planning', date: '2023-11-15', time: '10:00', attendees: ['u1', 'u2', 'u3', 'u4'], type: 'video' },
  { id: 'm2', title: 'Design Review', date: '2023-11-17', time: '14:00', attendees: ['u1', 'u3'], type: 'person' },
];