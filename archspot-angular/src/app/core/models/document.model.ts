export interface DocumentDTO {
  id: number;
  name: string;
  description?: string;
  uploadedById: number;
  directoryId: number;
  uploadDate: string;
  modificationDate: string;
  size: number;
  version: number;
  fileUrl: string;
}