package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.entities.*;
import com.archspot.ArchSpot_BackEnd.repositories.*;

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

  @Autowired
  private UserRepository userRepository;

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
    return documentRepository.findByDirectoryId(directoryId).stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // buscar documento por ID
  public DocumentDTO findById(Long id) {
    return documentRepository.findById(id)
        .map(this::toDTO)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
  }

  // cria documento sem arquivo para testes
  public DocumentDTO save(DocumentDTO dto) {
    Directory directory = directoryRepository.findById(dto.getDirectoryId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found"));

    User user = userRepository.findById(dto.getUploadedById())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    Document document = Document.builder()
        .name(dto.getName())
        .fileUrl(dto.getFileUrl())
        .description(dto.getDescription())
        .uploadDate(dto.getUploadDate() != null ? dto.getUploadDate() : LocalDateTime.now())
        .modificationDate(dto.getModificationDate())
        .size(dto.getSize())
        .version(dto.getVersion())
        .directory(directory)
        .uploadedBy(user)
        .build();

    return toDTO(documentRepository.save(document));
  }

  // atualizar metadados de um documento sem alterar o arquivo
  public DocumentDTO update(Long id, DocumentDTO dto) {
    Document document = documentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
    if (dto.getName() != null)
      document.setName(dto.getName());
    if (dto.getFileUrl() != null)
      document.setFileUrl(dto.getFileUrl());
    if (dto.getDescription() != null)
      document.setDescription(dto.getDescription());
    if (dto.getSize() != null)
      document.setSize(dto.getSize());
    if (dto.getVersion() != null)
      document.setVersion(dto.getVersion());
    document.setModificationDate(dto.getModificationDate() != null ? dto.getModificationDate() : LocalDateTime.now());
    if (dto.getDirectoryId() != null) {
      Directory directory = directoryRepository.findById(dto.getDirectoryId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found"));
      document.setDirectory(directory);
    }
    if (dto.getUploadedById() != null) {
      User user = userRepository.findById(dto.getUploadedById())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
      document.setUploadedBy(user);
    }
    return toDTO(documentRepository.save(document));
  }

  // excluir um documento
  public void delete(Long id) {
    Document document = documentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

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

  public DocumentDTO uploadDocument(Long directoryId, Long userId, MultipartFile file, String description)
      throws IOException {
    Directory directory = directoryRepository.findById(directoryId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found"));

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    // caminho local de armazenamento
    Path uploadDir = Paths.get(UPLOAD_BASE_PATH, directory.getType().name().toLowerCase());
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
    document.setUploadedBy(user);

    return toDTO(documentRepository.save(document));
  }

  /*
   * ATUALIZAÇÃO / NOVA VERSÃO
   */

  public DocumentDTO updateDocumentVersion(Long documentId, MultipartFile newFile) throws IOException {
    Document existing = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));

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
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
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
