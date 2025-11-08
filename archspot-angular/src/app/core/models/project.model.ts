export interface ProjectResponse {
  id: number;
  name: string;
  description?: string;
  estimatedStartDate?: Date;
  estimatedEndDate?: Date;
  realStartDate?: Date;
  realEndDate?: Date;
  totalValue?: number;
  status: string;
  phases?: any[];
  installments?: any[];
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
  description?: string;
  estimatedStartDate?: string | null;
  estimatedEndDate?: string | null;
  status?: string;
}