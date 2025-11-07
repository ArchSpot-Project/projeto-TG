package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.dtos.installment.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;

import java.util.Map;
import jakarta.persistence.EntityNotFoundException;

@Service
public class ProjectService {

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private PhaseService phaseService;

  @Autowired
  private InstallmentService installmentService;

  @Autowired
  private UserProjectService userProjectService;

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
    project.setDescription(dto.getDescription());
    project.updateDatesAndStatus();
    projectRepository.save(project);

    // vincula o criador como ADMIN
    UserProjectRequestDTO userProjectDto = new UserProjectRequestDTO(
        SecurityUtils.getCurrentUser().getId(),
        project.getId(),
        UserRole.ADMIN);
    userProjectService.assignUserToProject(userProjectDto);

    return toResponseDTO(project);
  }

  public ProjectResponseDTO update(Long id, ProjectRequestDTO dto) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));

    project.setName(dto.getName());
    project.setDescription(dto.getDescription());
    project.setTotalValue(dto.getTotalValue());
    project.updateDatesAndStatus();

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
    project.updateDatesAndStatus(); // redundante, melhorar no futuro
    return toResponseDTO(projectRepository.save(project));
  }

  public ProjectResponseDTO cancelProject(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    project.cancelProject();
    project.updateDatesAndStatus(); // redundante, melhorar no futuro
    return toResponseDTO(projectRepository.save(project));
  }

  public ProjectResponseDTO updateTitleAndDescription(Long id, Map<String, String> updates) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Projeto não encontrado"));

    if (updates.containsKey("name")) {
      project.setName(updates.get("name"));
    }
    if (updates.containsKey("description")) {
      project.setDescription(updates.get("description"));
    }

    projectRepository.save(project);
    return toResponseDTO(project);
  }

  // mapeamento entidade -> DTO
  private ProjectResponseDTO toResponseDTO(Project project) {
    List<PhaseDTO> phaseDTOs = project.getPhases() != null
        ? project.getPhases().stream()
            .map(phaseService::toDTO)
            .toList()
        : List.of();

    List<InstallmentResponseDTO> installmentDTOs = project.getInstallments() != null
        ? project.getInstallments().stream()
            .map(installmentService::toDTO)
            .toList()
        : List.of();

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
        phaseDTOs,
        installmentDTOs);
  }
}
