package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.archspot.ArchSpot_BackEnd.enums.*;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseDTO;
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

    // validação: data de fim não pode ser menor que data de início
    if (dto.estimatedStartDate() != null && dto.estimatedEndDate() != null) {
      if (dto.estimatedEndDate().isBefore(dto.estimatedStartDate())) {
        throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "A data estimada de fim não pode ser anterior à data estimada de início.");
      }
    }

    /*
     * TODO: Verificar lógica de negócio:
     * O código ainda não implementa a possibilidade de criação de fases com
     * vínculos COMPLEXOS:
     * antes, no meio ou depois das existentes, atualizando a sequencia de
     * associações adequadamente.
     * Deixei aqui para lembrar de refatorar no futuro.
     */

    // atribuição de predecessora SIMPLIFICADA (não considera a ordem das fases
    // existentes)
    Phase previous = null;
    if (dto.previousPhaseId() != null) {
      previous = phaseRepository.findById(dto.previousPhaseId())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Etapa predecessora inválida."));

      if (!previous.getProject().getId().equals(project.getId())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Etapa predecessora deve pertencer ao mesmo projeto.");
      }
    }

    // cria nova fase
    Phase newPhase = new Phase();
    newPhase.setName(dto.name());
    newPhase.setDescription(dto.description());
    newPhase.setEstimatedStartDate(dto.estimatedStartDate());
    newPhase.setEstimatedEndDate(dto.estimatedEndDate());
    newPhase.setRealStartDate(dto.realStartDate());
    newPhase.setRealEndDate(dto.realEndDate());
    newPhase.setDuration(
        (dto.estimatedStartDate() != null && dto.estimatedEndDate() != null)
            ? (int) java.time.temporal.ChronoUnit.DAYS.between(dto.estimatedStartDate(), dto.estimatedEndDate())
            : null);
    newPhase.setPreviousPhase(previous);
    newPhase.setProject(project);
    newPhase.setStatus(PhaseStatus.NOT_STARTED);

    Phase saved = phaseRepository.save(newPhase);

    project.updateDatesAndStatus();
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
    entity.setDuration(dto.duration());

    Phase updated = phaseRepository.save(entity);

    Project project = updated.getProject();
    project.updateDatesAndStatus();
    projectRepository.save(project);

    return toDTO(updated);
  }

  // deletar fase
  public void delete(Long id) {
    Phase entity = phaseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Phase not found"));

    Project project = entity.getProject();

    phaseRepository.delete(entity);

    project.updateDatesAndStatus();
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

    // etapa ainda não COMPLETED = em atraso se a data atual está após a data de
    // término estimada
    if (phase.getEstimatedEndDate() != null && today.isAfter(phase.getEstimatedEndDate())) {
      return PhaseStatus.OVERDUE;
    }

    return PhaseStatus.NOT_STARTED;
  }

  // iniciar etapa
  public PhaseDTO startPhase(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etapa não encontrada."));

    // etapa predecessora e validação - se houver e nao foi finalizada, lançar erro
    // 400
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

    // inicia o projeto se for o caso
    Project project = phase.getProject();
    project.updateDatesAndStatus();
    projectRepository.save(project);

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

    // finaliza projeto se for o caso
    Project project = phase.getProject();
    project.updateDatesAndStatus();
    projectRepository.save(project);

    return toDTO(updated);
  }

  public PhaseDTO toDTO(Phase entity) {
    Long previousId = entity.getPreviousPhase() != null ? entity.getPreviousPhase().getId() : null;
    Long projectId = entity.getProject() != null ? entity.getProject().getId() : null;

    PhaseStatus status = PhaseService.calculateStatus(entity);

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
