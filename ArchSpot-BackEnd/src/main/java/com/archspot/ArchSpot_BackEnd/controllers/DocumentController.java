package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.services.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "http://localhost:4200")
public class DocumentController {

  @Autowired
  private DocumentService documentService;

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

  // Buscar documentos por diretório
  @GetMapping("/directory/{directoryId}")
  public ResponseEntity<List<DocumentDTO>> getByDirectory(@PathVariable Long directoryId) {
    return ResponseEntity.ok(documentService.findByDirectory(directoryId));
  }

  // Criar documento (upload de arquivo + metadados)
  @PostMapping("/upload")
  public ResponseEntity<DocumentDTO> uploadDocument(
      @RequestParam("file") MultipartFile file,
      @RequestParam("directoryId") Long directoryId,
      @RequestParam("uploadedById") Long uploadedById,
      @RequestParam(value = "description", required = false) String description) throws IOException {
    DocumentDTO saved = documentService.uploadDocument(directoryId, uploadedById, file, description);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  // Atualizar metadados (sem reenviar arquivo)
  @PutMapping("/{id}")
  public ResponseEntity<DocumentDTO> update(@PathVariable Long id, @RequestBody DocumentDTO dto) {
    return ResponseEntity.ok(documentService.update(id, dto));
  }

  // Subir nova versão do arquivo (sobrescreve fisicamente e incrementa version)
  @PostMapping("/{id}/update")
  public ResponseEntity<DocumentDTO> uploadNewVersion(
      @PathVariable Long id,
      @RequestParam("file") MultipartFile file) throws IOException {
    DocumentDTO updated = documentService.updateDocumentVersion(id, file);
    return ResponseEntity.ok(updated);
  }

  // Deletar documento
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    documentService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
