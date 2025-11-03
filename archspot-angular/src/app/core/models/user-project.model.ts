export interface UserProjectResponse {
  id: number;
  userId: number;
  userName: string;
  projectId: number;
  projectName: string;
  role: string;
}

export interface UserProjectRequest {
  userId: number;
  role: string;
}