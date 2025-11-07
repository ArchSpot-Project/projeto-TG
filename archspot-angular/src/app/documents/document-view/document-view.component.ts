import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommentService } from '../../core/services/comment.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserProjectService } from '../../core/services/user-project.service';
import { DocumentDTO } from '../../core/models/document.model';
import { CommentDTO } from '../../core/models/comment.model';
import { DocumentService } from '../../core/services/document.service';

@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.css']
})
export class DocumentViewComponent implements OnInit {

  projectId!: number;
  itemId!: number;
  item!: DocumentDTO;
  itemBlobUrl!: SafeResourceUrl;
  fileType!: string;
  documentName = '';

  itemType: 'document' | 'drawing' = 'document';

  comments: CommentDTO[] = [];
  newCommentText = '';
  userId: number | null = null;
  userRole: string | null = null;
  userCache: { [id: number]: string } = {};

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private documentService: DocumentService,
    private authService: AuthService,
    private userService: UserService,
    private userProjectService: UserProjectService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    this.userId = currentUser?.id || null;

    this.route.params.subscribe(params => {
      this.projectId = +params['id'];
      this.itemId = +params['documentId'] || +params['drawingId'];
      this.itemType = this.route.snapshot.routeConfig?.path?.includes('drawings') ? 'drawing' : 'document';

      if (isNaN(this.projectId) || isNaN(this.itemId)) {
        console.error('Parâmetros inválidos na rota');
        return;
      }

      this.loadUserRole();
      this.loadItem();
      this.loadComments();
    });
  }

  get document() {
    return this.item;
  }

  get documentBlobUrl() {
    return this.itemBlobUrl;
  }

  loadUserRole(): void {
    if (!this.userId || !this.projectId) return;

    this.userProjectService.getUsersByProject(this.projectId).subscribe({
      next: users => {
        const current = users.find((u: any) => u.userId === this.userId);
        this.userRole = current?.role || null;
      },
      error: err => console.error('Erro ao carregar papel do usuário no projeto', err)
    });
  }

  loadItem(): void {
    this.documentService.getDocumentById(this.itemId).subscribe({
      next: (data) => {
        this.item = data;
        this.documentName = data.name;
        this.documentService.viewDocument(this.itemId).subscribe({
          next: (blob) => {
            const blobUrl = URL.createObjectURL(blob);
            this.itemBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
            this.fileType = blob.type;
          },
          error: (err) => console.error('Erro ao visualizar documento', err)
        });
      },
      error: (err) => console.error('Erro ao buscar documento', err)
    });
  }

  getMimeTypeFromName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext) return '';
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    if (ext === 'pdf') return 'application/pdf';
    return '';
  }

  loadComments(): void {
    this.commentService.getCommentsByDocument(this.itemId).subscribe({
      next: comments => {
        this.comments = comments;
        this.resolveUserNames(comments);
      },
      error: err => console.error('Erro ao carregar comentários', err)
    });
  }

  private resolveUserNames(comments: CommentDTO[]): void { //carrega o nome do usuario que realizou o comentario
    const uniqueIds = Array.from(new Set(comments.map(c => c.userId)));
    uniqueIds.forEach(id => {
      if (!this.userCache[id]) {
        this.userService.getUserById(id).subscribe({
          next: user => this.userCache[id] = user.name,
          error: () => this.userCache[id] = `Usuário ${id}`
        });
      }
    });
  }

  addComment(): void {
    if (!this.newCommentText.trim() || !this.userId) return;

    this.commentService.createComment(this.itemId, {
      text: this.newCommentText,
      userId: this.userId
    }).subscribe({
      next: comment => {
        this.comments.push(comment);
        this.newCommentText = '';
        alert("Comentário adicionado com sucesso.");
        location.reload();
        this.loadComments();
      },
      error: err => console.error('Erro ao adicionar comentário', err)
    });
  }

  deleteComment(commentId: number): void {
    if (!this.userId) return;
    const confirmed = confirm('Deseja realmente deletar este comentário?');
    if (!confirmed) return;

    this.commentService.deleteComment(commentId, this.userId).subscribe({
      next: () => {
        location.reload();
      },
      error: err => alert('Não foi possível deletar este comentário.')
    });
  }

  canDeleteComment(commentUserId: number): boolean { //so o admin ou dono do comentario pode deletar um comentario
    if (!this.userId) return false;
    return this.userId === commentUserId || this.userRole === 'ADMIN';
  }

  getUserName(userId: number): string {
    const current = this.authService.getUser();
    if (current?.id === userId) return current.name;
    return this.userCache[userId] || `Usuário ${userId}`;
  }
}
