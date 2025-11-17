package com.archspot.ArchSpot_BackEnd.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.archspot.ArchSpot_BackEnd.enums.*;
import com.archspot.ArchSpot_BackEnd.exceptions.BusinessRuleException;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.activities.services.handlers.PhaseActivityHandler;
import com.archspot.ArchSpot_BackEnd.dtos.phase.*;
import com.archspot.ArchSpot_BackEnd.entities.Phase;
import com.archspot.ArchSpot_BackEnd.repositories.PhaseRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.templates.dtos.PhaseTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.services.TemplateService;

@Service
public class PhaseService {

  @Autowired
  private PhaseRepository phaseRepository;

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private TemplateService templateService;

  @Autowired
  PhaseActivityHandler phaseActivityHandler;

  // consultar todas as fases
  public List<PhaseDTO> findAll() {
    return phaseRepository.findAll().stream()
        .map(this::toDTO)
        .toList();
  }

  // consultar uma fase pelo id
  public PhaseDTO findById(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etapa não encontrada."));
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
        .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado."));

    // validação: data de fim não pode ser menor que data de início
    validateDateOrder(dto.estimatedStartDate(), dto.estimatedEndDate(),
        "A data estimada de fim não pode ser anterior à data estimada de início.");

    /*
     * Verificar lógica de negócio futuramente:
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
          .orElseThrow(() -> new BusinessRuleException("Etapa predecessora inválida."));

      if (!previous.getProject().getId().equals(project.getId())) {
        throw new BusinessRuleException("Etapa predecessora deve pertencer ao mesmo projeto.");
      }
    }

    // cria nova fase
    Phase newPhase = new Phase();
    newPhase.setName(dto.name());
    newPhase.setDescription(dto.description());
    newPhase.setEstimatedStartDate(dto.estimatedStartDate());
    newPhase.setEstimatedEndDate(dto.estimatedEndDate());
    newPhase.setDuration(
        (dto.estimatedStartDate() != null && dto.estimatedEndDate() != null)
            ? (int) java.time.temporal.ChronoUnit.DAYS.between(dto.estimatedStartDate(), dto.estimatedEndDate())
            : null);
    newPhase.setPreviousPhase(previous);
    newPhase.setProject(project);
    newPhase.setStatus(PhaseStatus.NOT_STARTED);

    Phase saved = phaseRepository.save(newPhase);

    updateProject(project);
    phaseActivityHandler.created(SecurityUtils.getCurrentUser(), saved.getProject(), saved.getName());
    return toDTO(saved);
  }

  // criar fases pelo template
  @Transactional
  public List<Phase> createPhasesFromTemplate(Long projectId, LocalDate estimatedStartDate,
      List<PhaseCreateByTemplateDTO> phaseTemplates) {
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado: " + projectId));

    if (phaseTemplates == null || phaseTemplates.isEmpty()) {
      throw new BusinessRuleException("Nenhum template de etapa foi informado.");
    }

    // início da primeira fase (se não informado, usa hoje)
    LocalDate currentStart = estimatedStartDate != null ? estimatedStartDate : LocalDate.now();

    Phase previous = null;
    List<Phase> savedPhases = new ArrayList<>();

    for (PhaseCreateByTemplateDTO dto : phaseTemplates) {
      if (dto == null || dto.phaseTemplateId() == null) {
        throw new BusinessRuleException("Cada fase deve informar um phaseTemplateId válido.");
      }

      // busca o template correspondente (lança 404 se não existir)
      PhaseTemplateDTO tpl = templateService.findPhaseTemplateById(dto.phaseTemplateId());

      // monta a Phase baseada no template + duração enviada (se houver)
      Phase phase = new Phase();
      phase.setProject(project);
      phase.setName(tpl.getName());
      phase.setDescription(tpl.getDescription()); // se existir
      phase.setStatus(PhaseStatus.NOT_STARTED);

      // duração: usa a duração passada pelo front (dto.duration()) se presente,
      // caso contrário usa a do template; se nenhuma, considera 0
      Integer durationDays = dto.estimatedDurationDays() != null ? dto.estimatedDurationDays()
          : (tpl.getDefaultDurationDays() != null ? tpl.getDefaultDurationDays() : 0);
      phase.setDuration(durationDays);

      // datas estimadas encadeadas:
      phase.setEstimatedStartDate(currentStart);
      // definimos fim = start + duration - 1 (subtrai 1 para incluir data de inicio
      // na duração)
      phase.setEstimatedEndDate(currentStart.plusDays(durationDays - 1));

      // vincula predecessor encadeado
      if (previous != null) {
        phase.setPreviousPhase(previous);
      }

      // salva imediatamente e obtem id
      Phase saved = phaseRepository.save(phase);
      // adiciona à lista de persistência e avança ponteiros
      savedPhases.add(saved);
      previous = saved;
      currentStart = phase.getEstimatedEndDate(); // próxima começa quando esta termina
    }

    // Depois de salvar, atualiza as datas/status do projeto
    updateProject(project);

    return savedPhases;
  }

  // atualizar fase
  public PhaseDTO update(Long id, PhaseUpdateDTO dto) {
    Phase entity = phaseRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etapa não encontrada."));

    // validar coerência das datas reais
    validateDateOrder(dto.realStartDate(), dto.realEndDate(),
        "A data real de fim não pode ser anterior à data real de início.");

    // validar coerência das datas estimadas
    validateDateOrder(dto.estimatedStartDate(), dto.estimatedEndDate(),
        "A data estimada de fim não pode ser anterior à data estimada de início.");

    entity.setName(dto.name());
    entity.setDescription(dto.description());
    entity.setRealStartDate(dto.realStartDate());
    entity.setRealEndDate(dto.realEndDate());
    entity.setEstimatedStartDate(dto.estimatedStartDate());
    entity.setEstimatedEndDate(dto.estimatedEndDate());

    // calcula duração a partir das datas ou seta a recebida pela reuqisição
    if (dto.estimatedStartDate() != null && dto.estimatedEndDate() != null) {
      entity.setDuration((int) java.time.temporal.ChronoUnit.DAYS.between(
          dto.estimatedStartDate(), dto.estimatedEndDate()) + 1);
    } else {
      entity.setDuration(dto.duration());
    }

    entity.setStatus(PhaseService.calculateStatus(entity));

    Phase updated = phaseRepository.save(entity);

    updateProject(updated.getProject());
    phaseActivityHandler.updated(SecurityUtils.getCurrentUser(), updated.getProject(), updated.getName());
    return toDTO(updated);
  }

  // deletar fase
  public void delete(Long id) {
    Phase entity = phaseRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Phase not found"));

    Project project = entity.getProject();
    String phaseName = entity.getName();
    phaseRepository.delete(entity);

    updateProject(project);
    phaseActivityHandler.deleted(SecurityUtils.getCurrentUser(), project, phaseName);
  }

  // iniciar etapa
  public PhaseDTO startPhase(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etapa não encontrada."));

    /*
     * validações de etapa predecessora SUSPENSAS!
     */
    // // etapa predecessora e validação - se houver e nao foi finalizada, lançar
    // erro
    // // 400
    // if (phase.getPreviousPhase() != null) {
    // Phase previous = phase.getPreviousPhase();
    // if (previous.getRealEndDate() == null) {
    // throw new BusinessRuleException("Finalize a etapa anterior antes de iniciar
    // esta.");
    // }
    // }

    phase.setRealStartDate(LocalDateTime.now());
    phase.setStatus(PhaseStatus.IN_PROGRESS);
    Phase updated = phaseRepository.save(phase);

    // inicia o projeto se for o caso
    updateProject(updated.getProject());
    phaseActivityHandler.started(SecurityUtils.getCurrentUser(), updated.getProject(), updated.getName());
    return toDTO(updated);
  }

  // finalizar etapa
  public PhaseDTO finishPhase(Long id) {
    Phase phase = phaseRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Etapa não encontrada."));

    if (phase.getRealStartDate() == null) {
      throw new BusinessRuleException("Não é possível finalizar uma etapa que ainda não foi iniciada.");
    }
    phase.setRealEndDate(LocalDateTime.now());
    phase.setStatus(PhaseStatus.COMPLETED);
    Phase updated = phaseRepository.save(phase);

    // finaliza projeto se for o caso
    updateProject(updated.getProject());
    phaseActivityHandler.finished(SecurityUtils.getCurrentUser(), updated.getProject(), updated.getName());
    return toDTO(updated);
  }

  /*
   * METODOS AUXILIARES
   */

  private void updateProject(Project project) {
    project.updateDatesAndStatus();
    projectRepository.save(project);
  }

  private <T extends Comparable<T>> void validateDateOrder(T start, T end, String message) {
    if (start != null && end != null && end.compareTo(start) < 0) {
      throw new BusinessRuleException(message);
    }
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

  public PhaseDTO toDTO(Phase entity) {
    Long previousId = entity.getPreviousPhase() != null ? entity.getPreviousPhase().getId() : null;
    Long projectId = entity.getProject() != null ? entity.getProject().getId() : null;

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
        calculateStatus(entity).name());
  }
}
