package com.archspot.ArchSpot_BackEnd.templates.services;

import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.templates.dtos.PhaseTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.dtos.ProjectTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.entities.*;
import com.archspot.ArchSpot_BackEnd.templates.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TemplateService {

  private final ProjectTemplateRepository projectTemplateRepository;
  private final PhaseTemplateRepository phaseTemplateRepository;

  public TemplateService(ProjectTemplateRepository projectTemplateRepository,
      PhaseTemplateRepository phaseTemplateRepository) {
    this.projectTemplateRepository = projectTemplateRepository;
    this.phaseTemplateRepository = phaseTemplateRepository;
  }

  /*
   * ProjectTemplate
   */

  public List<ProjectTemplateDTO> findAllProjectTemplates() {
    return projectTemplateRepository.findAll().stream()
        .map(this::toProjectTemplateDTO)
        .toList();
  }

  public ProjectTemplateDTO findProjectTemplateById(Long id) {
    ProjectTemplate template = projectTemplateRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("ProjectTemplate not found: " + id));
    return toProjectTemplateDTO(template);
  }

  @Transactional
  public ProjectTemplateDTO saveProjectTemplate(ProjectTemplateDTO dto) {
    ProjectTemplate projectTemplate = new ProjectTemplate();
    projectTemplate.setName(dto.getName());
    projectTemplate.setDescription(dto.getDescription());
    projectTemplate.setCreatedBy(SecurityUtils.getCurrentUser());
    projectTemplate.setDefault(false);
    if (dto.getPhases() != null) {
      List<PhaseTemplate> phases = dto.getPhases().stream()
          .map(p -> phaseTemplateRepository.findById(p.getId())
              .orElseThrow(() -> new EntityNotFoundException("PhaseTemplate not found: " + p.getId())))
          .toList();
      projectTemplate.setPhaseTemplates(phases);
    }

    ProjectTemplate saved = projectTemplateRepository.save(projectTemplate);
    return toProjectTemplateDTO(saved);
  }

  @Transactional
  public ProjectTemplateDTO updateProjectTemplate(Long id, ProjectTemplateDTO dto) {
    ProjectTemplate existing = projectTemplateRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("ProjectTemplate not found: " + id));

    existing.setName(dto.getName());
    existing.setDescription(dto.getDescription());
    existing.getPhaseTemplates().clear();
    if (dto.getPhases() != null && !dto.getPhases().isEmpty()) {
      List<PhaseTemplate> phases = dto.getPhases().stream()
          .map(phaseDTO -> phaseTemplateRepository.findById(phaseDTO.getId())
              .orElseThrow(() -> new EntityNotFoundException("PhaseTemplate not found: " + phaseDTO.getId())))
          .toList();
      existing.getPhaseTemplates().addAll(phases);
    }

    ProjectTemplate saved = projectTemplateRepository.save(existing);
    return toProjectTemplateDTO(saved);
  }

  public void deleteProjectTemplate(Long id) {
    projectTemplateRepository.deleteById(id);
  }

  /*
   * PhaseTemplate
   */

  public List<PhaseTemplateDTO> findAllPhaseTemplates() {
    return phaseTemplateRepository.findAll().stream()
        .map(this::toPhaseTemplateDTO)
        .toList();
  }

  public PhaseTemplateDTO findPhaseTemplateById(Long id) {
    PhaseTemplate phase = phaseTemplateRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("PhaseTemplate not found: " + id));
    return toPhaseTemplateDTO(phase);
  }

  public List<PhaseTemplateDTO> findPhaseTemplatesByIds(List<Long> ids) {
    return phaseTemplateRepository.findAllById(ids).stream()
        .map(this::toPhaseTemplateDTO)
        .toList();
  }

  @Transactional
  public PhaseTemplateDTO savePhaseTemplate(PhaseTemplateDTO dto) {
    PhaseTemplate phaseTemplate = new PhaseTemplate();
    phaseTemplate.setName(dto.getName());
    phaseTemplate.setDefaultDurationDays((dto.getDefaultDurationDays()));
    phaseTemplate.setCreatedBy(SecurityUtils.getCurrentUser());
    phaseTemplate.setDefault(false);
    PhaseTemplate saved = phaseTemplateRepository.save(phaseTemplate);
    return toPhaseTemplateDTO(saved);
  }

  @Transactional
  public PhaseTemplateDTO updatePhaseTemplate(Long id, PhaseTemplateDTO dto) {
    PhaseTemplate phaseTemplate = phaseTemplateRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("PhaseTemplate not found: " + id));

    phaseTemplate.setName(dto.getName());
    phaseTemplate.setDefaultDurationDays((dto.getDefaultDurationDays()));

    PhaseTemplate saved = phaseTemplateRepository.save(phaseTemplate);
    return toPhaseTemplateDTO(saved);
  }

  public void deletePhaseTemplate(Long id) {
    phaseTemplateRepository.deleteById(id);
  }

  /*
   * mapeamentos auxiliares de conversão
   */

  private ProjectTemplateDTO toProjectTemplateDTO(ProjectTemplate projectTemplate) {
    ProjectTemplateDTO dto = new ProjectTemplateDTO();
    dto.setId(projectTemplate.getId());
    dto.setName(projectTemplate.getName());
    dto.setDescription(projectTemplate.getDescription());
    dto.setPhases(
        Optional.ofNullable(projectTemplate.getPhaseTemplates())
            .orElse(List.of())
            .stream()
            .filter(Objects::nonNull)
            .map(this::toPhaseTemplateDTO)
            .toList());
    dto.setCreatedBy(projectTemplate.getCreatedBy() != null ? projectTemplate.getCreatedBy().getId() : null);
    dto.setDefault(projectTemplate.isDefault());
    return dto;
  }

  private PhaseTemplateDTO toPhaseTemplateDTO(PhaseTemplate phaseTemplate) {
    PhaseTemplateDTO dto = new PhaseTemplateDTO();
    dto.setId(phaseTemplate.getId());
    dto.setName(phaseTemplate.getName());
    dto.setDefaultDurationDays(phaseTemplate.getDefaultDurationDays());
    return dto;
  }

  /*
   * Clonagem de templates para um novo usuário
   */

  @Transactional
  public void cloneDefaultTemplatesForUser(User newUser) {
    // Clonar PhaseTemplates padrão
    List<PhaseTemplate> defaultPhases = phaseTemplateRepository.findByIsDefaultTrue();
    Map<Long, PhaseTemplate> clonedPhaseMap = new HashMap<>();

    for (PhaseTemplate original : defaultPhases) {
      PhaseTemplate clone = new PhaseTemplate();
      clone.setName(original.getName());
      clone.setDefaultDurationDays(original.getDefaultDurationDays());
      clone.setCreatedBy(newUser);
      clone.setDefault(false);
      clonedPhaseMap.put(original.getId(), phaseTemplateRepository.save(clone));
    }

    // Clonar ProjectTemplates padrão
    List<ProjectTemplate> defaultProjects = projectTemplateRepository.findByIsDefaultTrue();

    for (ProjectTemplate original : defaultProjects) {
      ProjectTemplate clone = new ProjectTemplate();
      clone.setName(original.getName());
      clone.setDescription(original.getDescription());
      clone.setCreatedBy(newUser);
      clone.setDefault(false);

      // Relaciona as fases clonadas (mantém referência aos clones correspondentes)
      List<PhaseTemplate> clonedPhases = Optional.ofNullable(original.getPhaseTemplates())
          .orElse(List.of())
          .stream()
          .map(pt -> clonedPhaseMap.getOrDefault(pt.getId(), pt))
          .collect(Collectors.toList());
      clone.setPhaseTemplates(clonedPhases);

      projectTemplateRepository.save(clone);
    }
  }

}
