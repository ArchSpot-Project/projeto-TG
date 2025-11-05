package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.diretory.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.diretory.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.services.DirectoryService;
import com.archspot.ArchSpot_BackEnd.services.DocumentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/directories")
public class DirectoryController {

  @Autowired
  private DirectoryService directoryService;

  @Autowired
  private DocumentService documentService;

  /*
   * CRUD BÁSICO DE DIRETÓRIO
   */

  // Criar diretório e buscar diretório por projeto:
  // aninhados em ProjectController

  // Atualizar nome do diretório
  @PatchMapping("/{id}")
  public ResponseEntity<DirectoryDTO> updateName(
      @PathVariable Long id,
      @RequestBody Map<String, String> updates) {
    String newName = updates.get("name");
    DirectoryDTO updated = directoryService.updateDirectoryName(id, newName);
    return ResponseEntity.ok(updated);
  }

  // Remover diretório
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    directoryService.delete(id);
    return ResponseEntity.noContent().build();
  }

  /*
   * SUBDIRETÓRIOS
   */

  // Listar subdiretórios de um diretório
  @GetMapping("/{directoryId}/subdirectories")
  public ResponseEntity<List<DirectoryDTO>> listSubdirectories(@PathVariable Long directoryId) {
    List<DirectoryDTO> subdirs = directoryService.findSubdirectories(directoryId);
    return ResponseEntity.ok(subdirs);
  }

  // Criar subdiretório em um diretório
  @PostMapping("/{directoryId}/subdirectories")
  public ResponseEntity<DirectoryDTO> createSubdirectory(
      @PathVariable Long directoryId,
      @RequestBody DirectoryCreateDTO dto) {
    dto.setParentDirectoryId(directoryId);
    DirectoryDTO created = directoryService.createDirectory(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  /*
   * DOCUMENTOS
   */

  // Listar documentos de um diretório
  @GetMapping("/{directoryId}/documents")
  public ResponseEntity<List<DocumentDTO>> getByDirectory(@PathVariable Long directoryId) {
    List<DocumentDTO> documents = documentService.findByDirectory(directoryId);
    return ResponseEntity.ok(documents);
  }

  // Fazer upload de um documento em um diretório (vários PARAM)
  @PostMapping("/{directoryId}/documents")
  public ResponseEntity<DocumentDTO> uploadDocument(
      @PathVariable Long directoryId,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description) throws IOException {
    DocumentDTO saved = documentService.uploadDocument(directoryId, file, description);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }
}
