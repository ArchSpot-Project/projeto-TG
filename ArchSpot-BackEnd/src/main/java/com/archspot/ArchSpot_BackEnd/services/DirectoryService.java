package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.entities.Directory;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import com.archspot.ArchSpot_BackEnd.repositories.DirectoryRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DirectoryService {

  @Autowired
  private DirectoryRepository directoryRepository;

  @Autowired
  private ProjectRepository projectRepository;

  public DirectoryService(DirectoryRepository directoryRepository, ProjectRepository projectRepository) {
    this.directoryRepository = directoryRepository;
    this.projectRepository = projectRepository;
  }

  // buscar por projeto e tipo
  public List<DirectoryDTO> findByProjectAndType(Long projectId, DirectoryType type) {
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    List<Directory> list = (type != null) ? directoryRepository.findByProjectAndType(project, type)
        : directoryRepository.findByProjectId(projectId);
    return list.stream().map(this::toDTO).collect(Collectors.toList());
  }

  // criar diretório
  public DirectoryDTO createDirectory(DirectoryCreateDTO dto) {
    Project project = projectRepository.findById(dto.getProjectId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

    Directory directory = Directory.builder()
        .name(dto.getName())
        .type(dto.getType())
        .creationDate(LocalDateTime.now())
        .project(project)
        .build();

    Directory saved = directoryRepository.save(directory);
    return toDTO(saved);
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

  // buscar diretórios por projeto
  public List<DirectoryDTO> getDirectoriesByProject(Long projectId) {
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

  // mapeamento DTO
  private DirectoryDTO toDTO(Directory directory) {
    DirectoryDTO dto = new DirectoryDTO();
    dto.setId(directory.getId());
    dto.setName(directory.getName());
    dto.setType(directory.getType());
    dto.setCreationDate(directory.getCreationDate());
    dto.setProjectId(directory.getProject() != null ? directory.getProject().getId() : null);
    return dto;
  }
}
