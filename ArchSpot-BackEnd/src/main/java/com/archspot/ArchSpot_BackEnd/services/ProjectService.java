package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.dtos.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.ProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.ProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {

  private final ProjectRepository projectRepository;

  public List<ProjectResponseDTO> findAll() {
    return projectRepository.findAll()
        .stream()
        .map(this::toResponseDTO)
        .toList();
  }

  public ProjectResponseDTO findById(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    return toResponseDTO(project);
  }

  public ProjectResponseDTO create(ProjectRequestDTO dto) {
    Project project = new Project();
    project.setName(dto.getName());
    project.setEstimatedStartDate(dto.getEstimatedStartDate());
    project.setEstimatedEndDate(dto.getEstimatedEndDate());
    project.setDescription(dto.getDescription());
    project.setTotalValue(dto.getTotalValue());
    project.setStatus(dto.getStatus());
    return toResponseDTO(projectRepository.save(project));
  }

  public ProjectResponseDTO update(Long id, ProjectRequestDTO dto) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));

    project.setName(dto.getName());
    project.setEstimatedStartDate(dto.getEstimatedStartDate());
    project.setEstimatedEndDate(dto.getEstimatedEndDate());
    project.setDescription(dto.getDescription());
    project.setTotalValue(dto.getTotalValue());
    project.setStatus(dto.getStatus());

    return toResponseDTO(projectRepository.save(project));
  }

  public void delete(Long id) {
    if (!projectRepository.existsById(id)) {
      throw new EntityNotFoundException("Projeto não encontrado: " + id);
    }
    projectRepository.deleteById(id);
  }

  public ProjectResponseDTO finalizeProject(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    project.finalizeProject();
    return toResponseDTO(projectRepository.save(project));
  }

  public ProjectResponseDTO cancelProject(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    project.cancelProject();
    return toResponseDTO(projectRepository.save(project));
  }

  // mapeamento entidade -> DTO
  private ProjectResponseDTO toResponseDTO(Project project) {
    return new ProjectResponseDTO(
        project.getId(),
        project.getName(),
        project.getEstimatedStartDate(),
        project.getEstimatedEndDate(),
        project.getRealStartDate(),
        project.getRealEndDate(),
        project.getDescription(),
        project.getTotalValue(),
        project.getStatus(),
        project.getPhases() != null
            ? project.getPhases().stream()
                .map(phase -> new PhaseDTO(
                    phase.getId(),
                    phase.getName(),
                    phase.getDescription(),
                    phase.getEstimatedStartDate(),
                    phase.getEstimatedEndDate(),
                    phase.getRealStartDate(),
                    phase.getRealEndDate(),
                    phase.getDuration(),
                    phase.getPreviousPhase() != null ? phase.getPreviousPhase().getId() : null,
                    phase.getProject() != null ? phase.getProject().getId() : null))
                .toList()
            : List.of());
  }
}
