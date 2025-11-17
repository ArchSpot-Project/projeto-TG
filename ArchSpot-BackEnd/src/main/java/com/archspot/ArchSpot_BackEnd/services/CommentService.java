package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.activities.services.handlers.CommentActivityHandler;
import com.archspot.ArchSpot_BackEnd.dtos.comment.CommentCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.comment.CommentDTO;
import com.archspot.ArchSpot_BackEnd.entities.Comment;
import com.archspot.ArchSpot_BackEnd.entities.Document;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.CommentRepository;
import com.archspot.ArchSpot_BackEnd.repositories.DocumentRepository;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.utils.ProjectPermissionUtils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

  private final CommentRepository commentRepository;
  private final DocumentRepository documentRepository;
  private final CommentActivityHandler commentActivityHandler;

  // Criar comentário
  public CommentDTO createComment(Long documentId, CommentCreateDTO dto) {
    User currentUser = SecurityUtils.getCurrentUser();

    Document document = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

    Comment comment = Comment.builder()
        .text(dto.getText())
        .timestamp(LocalDateTime.now())
        .document(document)
        .user(currentUser)
        .build();

    Comment saved = commentRepository.save(comment);

    Project project = document.getDirectory().getProject();
    commentActivityHandler.added(
        currentUser,
        project,
        saved.getText());
    return toDTO(commentRepository.save(saved));
  }

  // Buscar comentários de um documento
  public List<CommentDTO> getCommentsByDocument(Long documentId) {
    Document document = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

    return commentRepository.findByDocument(document)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // Deletar comentário (apenas dono ou admin do projeto)
  @Transactional
  public void deleteComment(Long commentId) {
    Comment comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

    // Usuário autenticado (vem do token)
    User currentUser = SecurityUtils.getCurrentUser();

    // Resgata o projeto associado (comentário > documento > diretório > projeto)
    Project project = comment.getDocument().getDirectory().getProject();

    // Verifica se o usuário é dono do comentário
    boolean isOwner = comment.getUser().getId().equals(currentUser.getId());

    // Verifica se o usuário é ADMIN no projeto
    boolean isProjectAdmin = ProjectPermissionUtils.isAdmin(project, currentUser);

    if (!isOwner && !isProjectAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not allowed to delete this comment");
    }

    commentRepository.delete(comment);

    commentActivityHandler.deleted(
        currentUser,
        project);
  }

  // Mapper para DTO
  private CommentDTO toDTO(Comment comment) {
    return CommentDTO.builder()
        .id(comment.getId())
        .text(comment.getText())
        .timestamp(comment.getTimestamp())
        .documentId(comment.getDocument() != null ? comment.getDocument().getId() : null)
        .userId(comment.getUser() != null ? comment.getUser().getId() : null)
        .build();
  }
}
