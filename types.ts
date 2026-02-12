export type Priority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';
export type IssueType = 'Story' | 'Task' | 'Bug' | 'Epic';
export type Status = 'To Do' | 'In Progress' | 'In Review' | 'Done';
export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER' | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role?: UserRole;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  key: string; // e.g., PROJ-12
  title: string;
  description: string;
  type: IssueType;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  reporterId: string;
  sprintId?: string;
  storyPoints?: number;
  linkedIssueIds: string[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  leadId: string;
  avatarUrl?: string;
}

export interface AppState {
  currentUser: User;
  users: User[];
  projects: Project[];
  issues: Issue[];
  sprints: Sprint[];
  currentProjectId: string;
}