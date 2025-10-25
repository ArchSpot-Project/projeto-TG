package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.archspot.ArchSpot_BackEnd.enums.*;
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
    entity.setStatus(PhaseStatus.NOT_STARTED);

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

  // verificar status da etapa
  public static PhaseStatus calculateStatus(Phase phase) {
    LocalDate today = LocalDate.now();

    if (phase.getRealEndDate() != null) {
      return PhaseStatus.COMPLETED;
    }

    if (phase.getRealStartDate() != null) {
      if (phase.getEstimatedEndDate() != null && today.isAfter(phase.getEstimatedEndDate())) {
        return PhaseStatus.OVERDUE;
      }
      return PhaseStatus.IN_PROGRESS;
    }

    // etapa ainda não COMPLETED = em atraso se a data atual está após a data de término estimada
    if (phase.getEstimatedEndDate() != null && today.isAfter(phase.getEstimatedEndDate())) {
      return PhaseStatus.OVERDUE;
    }

    return PhaseStatus.NOT_STARTED;
  }

  // iniciar etapa
  public PhaseDTO startPhase(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Fase não encontrada."));

    // etapa predecessora e validação - se houver e nao foi finalizada, lançar erro 400
    if (phase.getPreviousPhase() != null) {
      Phase previous = phase.getPreviousPhase();
      if (previous.getRealEndDate() == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Finalize a etapa anterior antes de iniciar.");
      }
    }

    phase.setRealStartDate(LocalDateTime.now());
    phase.setStatus(PhaseStatus.IN_PROGRESS);

    Phase updated = phaseRepository.save(phase);
    return toDTO(updated);
  }

  // finalizar etapa
  public PhaseDTO finishPhase(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Fase não encontrada."));

    if (phase.getRealStartDate() == null) {
      throw new RuntimeException("Não é possível finalizar uma fase que ainda não foi iniciada.");
    }
    phase.setRealEndDate(LocalDateTime.now());
    phase.setStatus(PhaseStatus.COMPLETED);

    Phase updated = phaseRepository.save(phase);
    return toDTO(updated);
  }

  private PhaseDTO toDTO(Phase entity) {
    Long previousId = entity.getPreviousPhase() != null ? entity.getPreviousPhase().getId() : null;
    Long projectId = entity.getProject() != null ? entity.getProject().getId() : null;

    PhaseStatus status = entity.getStatus();
    if (status == PhaseStatus.NOT_STARTED && entity.getEstimatedEndDate() != null
        && LocalDate.now().isAfter(entity.getEstimatedEndDate())) {
      status = PhaseStatus.OVERDUE;
      entity.setStatus(status);
      phaseRepository.save(entity);
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
        projectId,
        status.name());
  }
}
