package com.archspot.ArchSpot_BackEnd.templates.services;

import com.archspot.ArchSpot_BackEnd.templates.dtos.PhaseTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.dtos.ProjectTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.entities.*;
import com.archspot.ArchSpot_BackEnd.templates.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

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

    // Evita NPE e garante lista ordenada
    if (projectTemplate.getPhaseTemplates() != null && !projectTemplate.getPhaseTemplates().isEmpty()) {
      dto.setPhases(
          projectTemplate.getPhaseTemplates().stream()
              .filter(Objects::nonNull)
              .sorted(Comparator.comparing(
                  pt -> pt.getSortOrder() != null ? pt.getSortOrder() : Integer.MAX_VALUE))
              .map(this::toPhaseTemplateDTO)
              .toList());
    } else {
      dto.setPhases(List.of());
    }
    return dto;
  }

  private PhaseTemplateDTO toPhaseTemplateDTO(PhaseTemplate phaseTemplate) {
    PhaseTemplateDTO dto = new PhaseTemplateDTO();
    dto.setId(phaseTemplate.getId());
    dto.setName(phaseTemplate.getName());
    dto.setDefaultDurationDays(phaseTemplate.getDefaultDurationDays());
    return dto;
  }
}
