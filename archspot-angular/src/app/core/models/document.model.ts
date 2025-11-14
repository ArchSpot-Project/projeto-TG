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

export interface DocumentVersionDTO {
  id: number;
  name: string;
  documentId: number;
  versionNumber: number;
  size: number;
  uploadedAt: string;
  fileUrl: string;
  description?: string;
}