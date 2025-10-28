package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.entities.Directory;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import com.archspot.ArchSpot_BackEnd.repositories.DirectoryRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DirectoryService {

  @Autowired
  private DirectoryRepository directoryRepository;

  @Autowired
  private ProjectRepository projectRepository;

  // buscar por projeto e tipo
  public List<DirectoryDTO> findByProjectAndType(Long projectId, DirectoryType type) {
    projectRepository.findById(projectId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

    List<Directory> directories = (type != null)
        ? directoryRepository.findByProjectIdAndType(projectId, type)
        : directoryRepository.findByProjectId(projectId);

    List<DirectoryDTO> dtos = directories.stream().map(this::toDTO).collect(Collectors.toList());
    return buildDirectoryTree(dtos);
  }

  // criar diretório
  public DirectoryDTO createDirectory(DirectoryCreateDTO dto) {
    Project project = projectRepository.findById(dto.getProjectId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

    Directory parent = null;
    if (dto.getParentDirectoryId() != null) {
      parent = directoryRepository.findById(dto.getParentDirectoryId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent directory not found"));

      // Impede subdiretórios em DOCUMENTS
      if (parent.getType() == DirectoryType.DOCUMENTS) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Directories of type DOCUMENTS cannot have subdirectories");
      }
    }

    Directory directory = Directory.builder()
        .name(dto.getName())
        .type(dto.getType())
        .creationDate(LocalDateTime.now())
        .project(project)
        .parentDirectory(parent)
        .build();

    return toDTO(directoryRepository.save(directory));
  }

  // atualizar diretório
  public DirectoryDTO updateDirectory(Long id, DirectoryCreateDTO dto) {
    Directory directory = directoryRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found"));
    directory.setName(dto.getName());
    directory.setType(dto.getType());
    Directory updated = directoryRepository.save(directory);
    return toDTO(updated);
  }

  @Transactional
  public DirectoryDTO updateDirectoryName(Long id, String newName) {
    Directory directory = directoryRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found"));
    directory.setName(newName);
    Directory updated = directoryRepository.save(directory);
    return toDTO(updated);
  }

  // buscar diretórios por projeto
  public List<DirectoryDTO> getDirectoriesByProject(Long projectId) {
    projectRepository.findById(projectId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    return directoryRepository.findByProjectId(projectId)
        .stream().map(this::toDTO).collect(Collectors.toList());
  }

  // deletar diretório
  public void delete(Long id) {
    if (!directoryRepository.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Directory not found");
    }
    directoryRepository.deleteById(id);
  }

  // buscar subdiretórios de um diretório
  public List<DirectoryDTO> findSubdirectories(Long directoryId) {
    directoryRepository.findById(directoryId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent directory not found"));

    List<Directory> subdirs = directoryRepository.findByParentDirectoryId(directoryId);
    return subdirs.stream()
        .map(this::toDTO)
        .toList();
  }

  /*
   * MÉTODOS UTILITÁRIOS
   */

  // mapeamento DTO
  private DirectoryDTO toDTO(Directory directory) {
    DirectoryDTO dto = new DirectoryDTO();
    dto.setId(directory.getId());
    dto.setName(directory.getName());
    dto.setType(directory.getType());
    dto.setCreationDate(directory.getCreationDate());
    dto.setProjectId(directory.getProject() != null ? directory.getProject().getId() : null);
    dto.setParentDirectoryId(directory.getParentDirectory() != null ? directory.getParentDirectory().getId() : null);

    dto.setSubdirectories(new ArrayList<>());

    // Converte os documentos associados em DocumentDTOs
    if (directory.getDocuments() != null && !directory.getDocuments().isEmpty()) {
      dto.setDocuments(
          directory.getDocuments().stream()
              .map(doc -> DocumentDTO.builder()
                  .id(doc.getId())
                  .name(doc.getName())
                  .uploadDate(doc.getUploadDate())
                  .modificationDate(doc.getModificationDate())
                  .size(doc.getSize())
                  .version(doc.getVersion())
                  .description(doc.getDescription())
                  .fileUrl(doc.getFileUrl())
                  .directoryId(directory.getId())
                  .uploadedById(doc.getUploadedBy() != null ? doc.getUploadedBy().getId() : null)
                  .build())
              .toList());
    } else {
      dto.setDocuments(new ArrayList<>());
    }
    return dto;
  }

  // cria arvore de diretórios
  public List<DirectoryDTO> buildDirectoryTree(List<DirectoryDTO> flatList) {
    Map<Long, DirectoryDTO> map = flatList.stream()
        .collect(Collectors.toMap(DirectoryDTO::getId, d -> d));

    List<DirectoryDTO> roots = new ArrayList<>();

    for (DirectoryDTO dto : flatList) {
      if (dto.getParentDirectoryId() != null) {
        DirectoryDTO parent = map.get(dto.getParentDirectoryId());
        if (parent != null) {
          if (parent.getSubdirectories() == null) {
            parent.setSubdirectories(new ArrayList<>());
          }
          parent.getSubdirectories().add(dto);
        }
      } else {
        roots.add(dto);
      }
    }
    return roots;
  }
}
