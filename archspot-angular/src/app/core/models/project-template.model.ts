export interface PhaseTemplateDTO {
  id?: number;
  name: string;
  description?: string;
  defaultDurationDays?: number;
}

export interface ProjectTemplateDTO {
  id?: number;
  name: string;
  description?: string;
  phases?: PhaseTemplateDTO[];
  createdBy?: number;
  isDefault?: boolean;
}
