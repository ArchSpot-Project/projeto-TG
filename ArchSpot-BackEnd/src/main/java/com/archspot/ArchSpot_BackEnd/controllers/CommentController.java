package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
@CrossOrigin(origins = "http://localhost:4200")
public class CommentController {

  @Autowired
  private CommentService commentService;

  // Listar comentários de um documento e Criar comentário
  // ficam aninhados em DocumentController

  // Deletar comentário (apenas dono ou admin do projeto)
  @DeleteMapping("/{commentId}")
  public ResponseEntity<Void> delete(@PathVariable Long commentId) {
    commentService.deleteComment(commentId);
    return ResponseEntity.noContent().build();
  }
}
