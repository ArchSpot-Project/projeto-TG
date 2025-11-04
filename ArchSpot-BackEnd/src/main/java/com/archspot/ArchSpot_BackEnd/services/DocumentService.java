package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentUpdateDTO;
import com.archspot.ArchSpot_BackEnd.entities.*;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.*;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.utils.ProjectPermissionUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

  @Autowired
  private DocumentRepository documentRepository;

  @Autowired
  private DirectoryRepository directoryRepository;

  private static final String UPLOAD_BASE_PATH = "./uploads";

  /*
   * CRUD BÁSICO
   */

  // buscar todos os documentos
  public List<DocumentDTO> findAll() {
    return documentRepository.findAll().stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // buscar documentos por diretório
  public List<DocumentDTO> findByDirectory(Long directoryId) {
    directoryRepository.findById(directoryId)
        .orElseThrow(() -> new ResourceNotFoundException( "Directory not found"));

    return documentRepository.findByDirectoryId(directoryId).stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // buscar documento por ID
  public DocumentDTO findById(Long id) {
    return documentRepository.findById(id)
        .map(this::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
  }

  // cria documento sem arquivo para testes
  public DocumentDTO save(DocumentDTO dto) {
    User currentUser = SecurityUtils.getCurrentUser();

    Directory directory = directoryRepository.findById(dto.getDirectoryId())
        .orElseThrow(() -> new ResourceNotFoundException( "Directory not found"));

    Document document = Document.builder()
        .name(dto.getName())
        .fileUrl(dto.getFileUrl())
        .description(dto.getDescription())
        .uploadDate(dto.getUploadDate() != null ? dto.getUploadDate() : LocalDateTime.now())
        .modificationDate(dto.getModificationDate())
        .size(dto.getSize())
        .version(dto.getVersion())
        .directory(directory)
        .uploadedBy(currentUser)
        .build();

    return toDTO(documentRepository.save(document));
  }

  // atualizar metadados de um documento (nome, descriçao e modifDate) sem alterar
  // o arquivo
  public DocumentDTO update(Long id, DocumentUpdateDTO dto) {
    Document document = documentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

    if (dto.name() != null)
      document.setName(dto.name());
    if (dto.description() != null)
      document.setDescription(dto.description());
    document.setModificationDate(LocalDateTime.now());

    return toDTO(documentRepository.save(document));
  }

  // excluir um documento
  public void delete(Long id) {
    Document document = documentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

    User currentUser = SecurityUtils.getCurrentUser();
    Directory directory = document.getDirectory();
    Project project = directory.getProject();
    DirectoryType directoryType = directory.getType();

    // Verifica se o usuário é dono do comentário
    boolean isOwner = document.getUploadedBy().getId().equals(currentUser.getId());

    // Verifica se o usuário é ADMIN ou STAFF no projeto
    boolean isProjectAdminOrStaff = ProjectPermissionUtils.isAdminOrStaff(project, currentUser);

    // Verifica se o usuário é EXTERNAL_COLLABORATOR no projeto
    boolean isExternalCollaborator = ProjectPermissionUtils.isExternalCollaborator(project, currentUser);

    // Regras por tipo de diretório:
    if (directoryType == DirectoryType.DRAWINGS) {
      // Só admin/staff ou externo (se dono)
      if (!isProjectAdminOrStaff && !(isOwner && isExternalCollaborator)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
            "User not allowed to delete this file");
      }
    } else if (directoryType == DirectoryType.DOCUMENTS) {
      // Admin/staff ou owner
      if (!isProjectAdminOrStaff && !isOwner) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
            "User not allowed to delete this file");
      }
    }

    // remove o arquivo físico
    try {
      Path filePath = Paths.get(document.getFileUrl());
      Files.deleteIfExists(filePath);
    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting file", e);
    }

    // remove do banco
    documentRepository.deleteById(id);
  }

  /*
   * SALVAR NOVO DOCUMENTO
   */

  public DocumentDTO uploadDocument(Long directoryId, MultipartFile file, String description)
      throws IOException {
    User currentUser = SecurityUtils.getCurrentUser();

    Directory directory = directoryRepository.findById(directoryId)
        .orElseThrow(() -> new ResourceNotFoundException( "Directory not found"));

    // garante que o diretório está vinculado a um projeto
    if (directory.getProject() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Directory must be linked to a project");
    }
    Long projectId = directory.getProject().getId();

    // caminho local de armazenamento
    Path uploadDir = Paths.get(UPLOAD_BASE_PATH,
        "project_" + projectId,
        directory.getType().name().toLowerCase());
    Files.createDirectories(uploadDir);

    String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    Path filePath = uploadDir.resolve(filename);
    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

    Document document = new Document();
    document.setName(file.getOriginalFilename());
    document.setDescription(description);
    document.setFileUrl(filePath.toString());
    document.setUploadDate(LocalDateTime.now());
    document.setModificationDate(LocalDateTime.now());
    document.setSize(file.getSize());
    document.setVersion(1);
    document.setDirectory(directory);
    document.setUploadedBy(currentUser);

    return toDTO(documentRepository.save(document));
  }

  /*
   * ATUALIZAÇÃO / NOVA VERSÃO
   */

  public DocumentDTO updateDocumentVersion(Long documentId, MultipartFile newFile) throws IOException {
    Document existing = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

    Directory directory = existing.getDirectory();

    // substitui arquivo físico
    Path uploadDir = Paths.get(UPLOAD_BASE_PATH, directory.getType().name().toLowerCase());
    Files.createDirectories(uploadDir);

    String newFilename = System.currentTimeMillis() + "_" + newFile.getOriginalFilename();
    Path newPath = uploadDir.resolve(newFilename);
    Files.copy(newFile.getInputStream(), newPath, StandardCopyOption.REPLACE_EXISTING);

    // atualiza metadados
    existing.setFileUrl(newPath.toString());
    existing.setModificationDate(LocalDateTime.now());
    existing.setSize(newFile.getSize());
    existing.setVersion(existing.getVersion() != null ? existing.getVersion() + 1 : 1);

    return toDTO(documentRepository.save(existing));
  }

  /*
   * DOWNLOAD
   */

  public Path getFilePath(Long documentId) {
    Document document = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    return Paths.get(document.getFileUrl());
  }

  // mapeamento DTO
  private DocumentDTO toDTO(Document document) {
    return DocumentDTO.builder()
        .id(document.getId())
        .name(document.getName())
        .fileUrl(document.getFileUrl())
        .description(document.getDescription())
        .uploadDate(document.getUploadDate())
        .modificationDate(document.getModificationDate())
        .size(document.getSize())
        .version(document.getVersion())
        .directoryId(document.getDirectory() != null ? document.getDirectory().getId() : null)
        .uploadedById(document.getUploadedBy() != null ? document.getUploadedBy().getId() : null)
        .build();
  }
}
