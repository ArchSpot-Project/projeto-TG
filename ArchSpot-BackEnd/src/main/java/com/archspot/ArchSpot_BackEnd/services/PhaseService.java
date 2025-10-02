package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.dtos.PhaseCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.Phase;
import com.archspot.ArchSpot_BackEnd.repositories.PhaseRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;

@Service
public class PhaseService {

  @Autowired
  private PhaseRepository phaseRepository;

  @Autowired
  private ProjectRepository projectRepository;

  // consultar todas as fases
  public List<PhaseDTO> findAll() {
    return phaseRepository.findAll().stream()
        .map(this::toDTO)
        .toList();
  }

  // consultar uma fase pelo id
  public PhaseDTO findById(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Phase not found"));
    return toDTO(phase);
  }

  // consultar fases por projeto
  public List<PhaseDTO> findByProject(Long projectId) {
    return phaseRepository.findByProjectId(projectId).stream()
        .map(this::toDTO)
        .toList();
  }

  // criar fase
  public PhaseDTO create(PhaseCreateDTO dto) {

    Project project = projectRepository.findById(dto.projectId())
        .orElseThrow(() -> new RuntimeException("Project not found"));

    Phase previous = null;
    if (dto.previousPhaseId() != null) {
      previous = phaseRepository.findById(dto.previousPhaseId())
          .orElseThrow(() -> new RuntimeException("Previous phase not found"));
    }

    Phase entity = new Phase();
    entity.setName(dto.name());
    entity.setDescription(dto.description());
    entity.setEstimatedStartDate(dto.estimatedStartDate());
    entity.setEstimatedEndDate(dto.estimatedEndDate());
    entity.setRealStartDate(dto.realStartDate());
    entity.setRealEndDate(dto.realEndDate());
    entity.setDuration(dto.duration());
    entity.setPreviousPhase(previous);
    entity.setProject(project);

    Phase saved = phaseRepository.save(entity);

    project.updateEstimatedDates();
    projectRepository.save(project);
    
    return toDTO(saved);
  }

  // atualizar fase
  public PhaseDTO update(Long id, PhaseCreateDTO dto) {
    Phase entity = phaseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Phase not found"));

    entity.setName(dto.name());
    entity.setDescription(dto.description());
    entity.setEstimatedStartDate(dto.estimatedStartDate());
    entity.setEstimatedEndDate(dto.estimatedEndDate());
    entity.setRealStartDate(dto.realStartDate());
    entity.setRealEndDate(dto.realEndDate());
    entity.setDuration(dto.duration());

    Phase updated = phaseRepository.save(entity);

    Project project = updated.getProject();
    project.updateEstimatedDates();
    projectRepository.save(project);

    return toDTO(updated);
  }

  // deletar fase
  public void delete(Long id) {
    Phase entity = phaseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Phase not found"));

    Project project = entity.getProject();

    phaseRepository.delete(entity);

    project.updateEstimatedDates();
    projectRepository.save(project);
  }

  // metodo privado para converter a entidade em DTO
  private PhaseDTO toDTO(Phase entity) {
    Long previousId = null;
    if (entity.getPreviousPhase() != null) {
      previousId = entity.getPreviousPhase().getId();
    }

    Long projectId = null;
    if (entity.getProject() != null) {
      projectId = entity.getProject().getId();
    }

    return new PhaseDTO(
        entity.getId(),
        entity.getName(),
        entity.getDescription(),
        entity.getEstimatedStartDate(),
        entity.getEstimatedEndDate(),
        entity.getRealStartDate(),
        entity.getRealEndDate(),
        entity.getDuration(),
        previousId,
        projectId);
  }

}
