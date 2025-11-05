export interface Photo {
  id: number;
  name: string;
  fileUrl?: string;
  uploadDate?: string;
  size?: number;
  uploadedById?: number;
  uploadedByName?: string; 
}