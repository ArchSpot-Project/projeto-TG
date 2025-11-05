import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentCreateDTO, CommentDTO } from '../models/comment.model';

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private baseUrl = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    getCommentsByDocument(documentId: number): Observable<CommentDTO[]> {
        return this.http.get<CommentDTO[]>(`${this.baseUrl}/documents/${documentId}/comments`);
    }

    createComment(documentId: number, dto: { text: string; userId: number }): Observable<CommentDTO> {
        return this.http.post<CommentDTO>(`${this.baseUrl}/documents/${documentId}/comments`, dto);
    }

    deleteComment(commentId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/comments/${commentId}?userId=${userId}`);
    }
}
