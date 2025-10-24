package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.entities.Directory;
import com.archspot.ArchSpot_BackEnd.entities.Project;
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

  // criar diretório
  public DirectoryDTO createDirectory(DirectoryCreateDTO dto) {
    Project project = projectRepository.findById(dto.getProjectId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

    Directory directory = new Directory();
    directory.setName(dto.getName());
    directory.setType(dto.getType());
    directory.setCreationDate(LocalDateTime.now());
    directory.setProject(project);

    Directory saved = directoryRepository.save(directory);
    return toDTO(saved);
  }

  // buscar diretórios por projeto
  public List<DirectoryDTO> getDirectoriesByProject(Long projectId) {
    return directoryRepository.findByProjectId(projectId)
        .stream().map(this::toDTO).collect(Collectors.toList());
  }

  // mapeamento DTO
  private DirectoryDTO toDTO(Directory directory) {
    DirectoryDTO dto = new DirectoryDTO();
    dto.setId(directory.getId());
    dto.setName(directory.getName());
    dto.setType(directory.getType());
    dto.setCreationDate(directory.getCreationDate());
    dto.setProjectId(directory.getProject().getId());
    return dto;
  }
}
