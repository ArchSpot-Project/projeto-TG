package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.CommentCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.CommentDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.services.CommentService;
import com.archspot.ArchSpot_BackEnd.services.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:4200")
public class DocumentController {

  @Autowired
  private DocumentService documentService;

  @Autowired
  private CommentService commentService;

  /*
   * CRUD DE DOCUMENTO
   */

  // Buscar todos os documentos
  @GetMapping
  public ResponseEntity<List<DocumentDTO>> getAll() {
    return ResponseEntity.ok(documentService.findAll());
  }

  // Buscar documento por ID
  @GetMapping("/{id}")
  public ResponseEntity<DocumentDTO> getById(@PathVariable Long id) {
    return ResponseEntity.ok(documentService.findById(id));
  }

  // Criar (upload) um documento e Buscar por diretório:
  // aninhados em DirectoryController

  // Atualizar metadados (sem reenviar arquivo)
  @PutMapping("/{id}")
  public ResponseEntity<DocumentDTO> update(@PathVariable Long id, @RequestBody DocumentDTO dto) {
    return ResponseEntity.ok(documentService.update(id, dto));
  }

  // Subir nova versão do arquivo (sobrescreve fisicamente e incrementa version)
  @PostMapping("/{id}/update")
  public ResponseEntity<DocumentDTO> uploadNewVersion(
      @PathVariable Long id,
      @RequestParam MultipartFile file) throws IOException {
    DocumentDTO updated = documentService.updateDocumentVersion(id, file);
    return ResponseEntity.ok(updated);
  }

  // Deletar documento
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    documentService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // Download de um arquivo
  @GetMapping("/{id}/download")
  public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws IOException {
    Path filePath = documentService.getFilePath(id);

    if (!Files.exists(filePath)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found on server");
    }

    Resource resource = new UrlResource(filePath.toUri());

    String contentType = Files.probeContentType(filePath);
    if (contentType == null) {
      contentType = "application/octet-stream";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName() + "\"")
        .body(resource);
  }

  /*
   * ENDPOINT DE COMENTÁRIO EM DOCUMENTO
   */

  // Listar comentários de um documento
  @GetMapping("/{documentId}/comments")
  public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long documentId) {
    List<CommentDTO> comments = commentService.getCommentsByDocument(documentId);
    return ResponseEntity.ok(comments);
  }

  // Criar comentário em um documento
  @PostMapping("/{documentId}/comments")
  public ResponseEntity<CommentDTO> createComment(
      @PathVariable Long documentId,
      @RequestBody CommentCreateDTO dto) {
    CommentDTO saved = commentService.createComment(documentId, dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

}
