export interface CommentDTO {
  id: number;
  text: string;
  timestamp: string;
  documentId: number;
  userId: number;
}

export interface CommentCreateDTO {
  text: string;
  userId: number;
}
