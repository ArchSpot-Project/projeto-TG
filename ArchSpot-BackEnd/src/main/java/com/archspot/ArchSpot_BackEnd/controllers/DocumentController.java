package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.comment.CommentCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.comment.CommentDTO;
import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentUpdateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentVersionDTO;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.services.CommentService;
import com.archspot.ArchSpot_BackEnd.services.DocumentService;
import com.archspot.ArchSpot_BackEnd.services.DocumentVersionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

  @Autowired
  private DocumentService documentService;

  @Autowired
  private CommentService commentService;

  @Autowired
  private DocumentVersionService documentVersionService;

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
  public ResponseEntity<DocumentDTO> update(@PathVariable Long id, @RequestBody DocumentUpdateDTO dto) {
    return ResponseEntity.ok(documentService.update(id, dto));
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
      throw new ResourceNotFoundException("File not found on server");
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

  // Visualização inline de um arquivo
  @GetMapping("/{id}/view")
  public ResponseEntity<Resource> viewFile(@PathVariable Long id) throws IOException {
    Path filePath = documentService.getFilePath(id);

    if (!Files.exists(filePath)) {
      throw new ResourceNotFoundException("File not found on server");
    }

    Resource resource = new UrlResource(filePath.toUri());

    String contentType = Files.probeContentType(filePath);
    if (contentType == null) {
      contentType = "application/octet-stream";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
        .body(resource);
  }

  /*
   * ENDPOINT DE VERSÕES DE UM DOCUMENTO
   */

  // Subir nova versão do arquivo
  // (guarda versão atual em DocumentVersion e atualiza a nova como principal)
  @PostMapping("/{id}/update")
  public ResponseEntity<DocumentDTO> uploadNewVersion(
      @PathVariable Long id,
      @RequestParam MultipartFile file) throws IOException {
    DocumentDTO updated = documentService.updateDocumentVersion(id, file);
    return ResponseEntity.ok(updated);
  }

  // Listar versões anteriores de um documento
  @GetMapping("/{id}/versions")
  public ResponseEntity<List<DocumentVersionDTO>> getVersions(@PathVariable Long id) {
    List<DocumentVersionDTO> versions = documentVersionService.getVersionsByDocument(id);
    return ResponseEntity.ok(versions);
  }

  // Visualizar uma versão específica de um documento
  @GetMapping("/versions/{versionId}/view")
  public ResponseEntity<Resource> viewVersionFile(@PathVariable Long versionId) throws IOException {
    Path filePath = documentVersionService.getFilePath(versionId);

    if (!Files.exists(filePath)) {
      throw new ResourceNotFoundException("File not found on server");
    }

    Resource resource = new UrlResource(filePath.toUri());

    String contentType = Files.probeContentType(filePath);
    if (contentType == null) {
      contentType = "application/octet-stream";
    }

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
        .body(resource);
  }

  // Download de uma versão específica de um documento
  @GetMapping("/versions/{versionId}/download")
  public ResponseEntity<Resource> downloadVersionFile(@PathVariable Long versionId) throws IOException {
    Path filePath = documentVersionService.getFilePath(versionId);

    if (!Files.exists(filePath)) {
      throw new ResourceNotFoundException("File not found on server");
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
