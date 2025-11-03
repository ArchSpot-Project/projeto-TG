package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.comment.CommentCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.comment.CommentDTO;
import com.archspot.ArchSpot_BackEnd.entities.Comment;
import com.archspot.ArchSpot_BackEnd.entities.Document;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.repositories.CommentRepository;
import com.archspot.ArchSpot_BackEnd.repositories.DocumentRepository;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;

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
  private final UserRepository userRepository;

  // Criar comentário
  public CommentDTO createComment(Long documentId, CommentCreateDTO dto) {
    Document document = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

    User user = userRepository.findById(dto.getUserId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    Comment comment = Comment.builder()
        .text(dto.getText())
        .timestamp(LocalDateTime.now())
        .document(document)
        .user(user)
        .build();

    return toDTO(commentRepository.save(comment));
  }

  // Buscar comentários de um documento
  public List<CommentDTO> getCommentsByDocument(Long documentId) {
    Document document = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

    return commentRepository.findByDocument(document)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // Deletar comentário (apenas dono ou admin do projeto)
  @Transactional
  public void deleteComment(Long commentId, Long userId) {
    Comment comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

    userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    Project project = comment.getDocument().getDirectory().getProject();

    // Verifica se o usuário é dono do comentário
    boolean isOwner = comment.getUser().getId().equals(userId);

    // Verifica se o usuário é ADMIN no projeto
    boolean isProjectAdmin = project.getUserProjects().stream()
        .anyMatch(up -> up.getUser().getId().equals(userId)
            && up.getRole().name().equalsIgnoreCase("ADMIN"));

    if (!isOwner && !isProjectAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not allowed to delete this comment");
    }

    commentRepository.delete(comment);
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
