export interface Album {
  id: number;
  name: string;
  description?: string;
  creationDate?: string;
  projectId: number;
  photos?: any[];
}