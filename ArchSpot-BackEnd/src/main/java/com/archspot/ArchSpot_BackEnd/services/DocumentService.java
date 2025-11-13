package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentUpdateDTO;
import com.archspot.ArchSpot_BackEnd.entities.*;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import com.archspot.ArchSpot_BackEnd.exceptions.BadRequestException;
import com.archspot.ArchSpot_BackEnd.exceptions.ForbiddenOperationException;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.*;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.utils.ProjectPermissionUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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

  @Autowired
  private DocumentVersionRepository documentVersionRepository;

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
        .orElseThrow(() -> new ResourceNotFoundException("Directory not found"));

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
        .orElseThrow(() -> new ResourceNotFoundException("Directory not found"));

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
  @Transactional
  public void delete(Long id) {
    Document document = documentRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

    User currentUser = SecurityUtils.getCurrentUser();

    // valida permissao do usuário
    validateDeletePermission(document, currentUser);

    // Excluir arquivos físicos das versões antigas
    List<DocumentVersion> versions = documentVersionRepository.findByDocumentId(id);
    for (DocumentVersion version : versions) {
      safeDeleteFile(version.getFileUrl());
    }

    // remove o arquivo físico
    safeDeleteFile(document.getFileUrl());

    // Remove versões associadas (garantia adicional ao cascade)
    documentVersionRepository.deleteAllByDocumentId(id);

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
        .orElseThrow(() -> new ResourceNotFoundException("Directory not found"));

    // Validação: proibir upload em diretórios raiz de DRAWINGS
    if (directory.getType() == DirectoryType.DRAWINGS && directory.getParentDirectory() == null) {
      throw new ForbiddenOperationException(
          "Uploads are not allowed in root DRAWINGS directories.");
    }

    // garante que o diretório está vinculado a um projeto
    if (directory.getProject() == null) {
      throw new BadRequestException("Directory must be linked to a project");
    }

    // caminho local de armazenamento
    Path uploadDir = resolveUploadPath(directory);

    Path filePath = saveFile(file, uploadDir);

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

    // Salva a versão anterior no histórico
    DocumentVersion previous = DocumentVersion.builder()
        .document(existing)
        .versionNumber(existing.getVersion())
        .fileUrl(existing.getFileUrl())
        .size(existing.getSize())
        .uploadedAt(existing.getModificationDate())
        .build();
    documentVersionRepository.save(previous);

    // Remove versões antigas se ultrapassar 3
    List<DocumentVersion> versions = documentVersionRepository.findByDocumentOrderByVersionNumberDesc(existing);
    if (versions.size() > 3) {
      DocumentVersion oldest = versions.get(versions.size() - 1);
      safeDeleteFile(oldest.getFileUrl());
      documentVersionRepository.delete(oldest);
    }

    // Substitui o arquivo principal
    Directory directory = existing.getDirectory();
    Path uploadDir = resolveUploadPath(directory);

    Path newPath = saveFile(newFile, uploadDir);

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

  /*
   * AUXILIARES
   */

  // montar caminhos de arquivo
  private Path resolveUploadPath(Directory directory) throws IOException {
    Long projectId = directory.getProject() != null ? directory.getProject().getId() : null;
    String dirType = directory.getType().name().toLowerCase();

    Path uploadDir = (projectId != null)
        ? Paths.get(UPLOAD_BASE_PATH, "project_" + projectId, dirType)
        : Paths.get(UPLOAD_BASE_PATH, dirType);

    Files.createDirectories(uploadDir);
    return uploadDir;
  }

  // salvar arquivo
  private Path saveFile(MultipartFile file, Path uploadDir) throws IOException {
    String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    Path filePath = uploadDir.resolve(filename);
    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
    return filePath;
  }

  private void validateDeletePermission(Document document, User currentUser) {
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
        throw new ForbiddenOperationException(
            "User not allowed to delete this file");
      }
    } else if (directoryType == DirectoryType.DOCUMENTS) {
      // Admin/staff ou owner
      if (!isProjectAdminOrStaff && !isOwner) {
        throw new ForbiddenOperationException(
            "User not allowed to delete this file");
      }
    }
  }

  // deletar arquivo fisico seguramente
  private void safeDeleteFile(String fileUrl) {
    try {
      Files.deleteIfExists(Paths.get(fileUrl));
    } catch (IOException e) {
      throw new RuntimeException("Error deleting file", e);
    }
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
