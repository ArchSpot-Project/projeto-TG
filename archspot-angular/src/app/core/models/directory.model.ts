export interface DirectoryDTO {
  id: number;
  name: string;
  creationDate: string;
  type: string;
  projectId: number;
  parentDirectoryId?: number | null;
  subdirectories?: DirectoryDTO[];
  documents?: any[];
}