export interface ProjectResponse {
  id: number;
  name: string;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  realStartDate?: Date;
  realEndDate?: Date;
  description?: string;
  totalValue?: number;
  status?: string;
  phases?: any[];
}

export interface UserProjectResponse {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  role: string;
}

export interface CreateProjectRequest {
  name: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  description?: string;
  status?: string;
}