package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.dtos.installment.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import java.util.Map;
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
                phase.getProject() != null ? phase.getProject().getId() : null,
                PhaseService.calculateStatus(phase).name() 
            ))
            .toList()
        : List.of();

    List<InstallmentResponseDTO> installmentDTOs = project.getInstallments() != null
        ? project.getInstallments().stream()
            .map(installment -> new InstallmentResponseDTO(
                installment.getId(),
                installment.getEstimatedPaymentDate(),
                installment.getRealPaymentDate(),
                installment.getPaymentMethod(),
                installment.getPaymentStatus(),
                installment.getAmount(),
                installment.getDescription(),
                installment.getProject() != null ? installment.getProject().getId() : null))
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
