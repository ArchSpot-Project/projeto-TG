export interface Phase {
  id?: number;
  name: string;
  description: string;
  estimatedStartDate: string;
  estimatedEndDate: string;
  realStartDate?: string;
  realEndDate?: string;
  status?: string;
  projectId: number;
  predecessorId?: number | null;
}

export interface PhaseWithProject extends Phase {
  projectName: string;
  projectStatus: string;
}