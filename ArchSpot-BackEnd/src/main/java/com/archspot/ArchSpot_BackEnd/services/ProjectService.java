package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.archspot.ArchSpot_BackEnd.activities.services.handlers.ProjectActivityHandler;
import com.archspot.ArchSpot_BackEnd.dtos.installment.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectCreateFromTemplateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.project.ProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.entities.Phase;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.enums.PhaseStatus;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.exceptions.BusinessRuleException;
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

  @Autowired
  private DirectoryService directoryService;

  @Autowired
  private ProjectActivityHandler projectActivityHandler;

  public List<ProjectResponseDTO> findAll() {
    return projectRepository.findAll()
        .stream()
        .map(this::toResponseDTO)
        .toList();
  }

  // buscar projeto por id
  public ProjectResponseDTO findById(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    return toResponseDTO(project);
  }

  // criar projeto (direto, sem ProjectTemplate nem PhaseTemplate)
  // (provavelmente vai ser descontinuado pois não faz sentido)
  @Transactional
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

    directoryService.createDefaultDirectories(project);

    return toResponseDTO(project);
  }

  // atualizar projeto
  public ProjectResponseDTO update(Long id, ProjectRequestDTO dto) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));

    project.setName(dto.getName());
    project.setDescription(dto.getDescription());
    project.setTotalValue(dto.getTotalValue());
    project.updateDatesAndStatus();

    Project saved = projectRepository.save(project);

    projectActivityHandler.updated(
        SecurityUtils.getCurrentUser(),
        saved, dto.getName(),
        dto.getDescription());
    return toResponseDTO(saved);
  }

  // deletar projeto
  public void delete(Long id) {
    if (!projectRepository.existsById(id)) {
      throw new EntityNotFoundException("Projeto não encontrado: " + id);
    }
    projectRepository.deleteById(id);
  }

  // finalizar projeto
  @Transactional
  public ProjectResponseDTO finalizeProject(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));

    List<Phase> phases = project.getPhases();

    boolean temFasesNaoIniciadas = phases.stream()
        .anyMatch(phase -> phase.getRealStartDate() == null);

    if (temFasesNaoIniciadas) {
      throw new BusinessRuleException(
          "Não é possível finalizar um projeto com etapas não iniciadas.");
    }

    List<Long> fasesAEncerrar = phases.stream()
        .filter(phase -> phase.getStatus() == PhaseStatus.IN_PROGRESS)
        .map(Phase::getId)
        .toList();

    for (Long phaseId : fasesAEncerrar) {
      phaseService.finishPhase(phaseId);
    }

    project.updateDatesAndStatus();
    project.finalizeProject();
    Project saved = projectRepository.save(project);

    projectActivityHandler.finalized(SecurityUtils.getCurrentUser(), saved);
    return toResponseDTO(saved);
  }

  // cancelar projeto
  public ProjectResponseDTO cancelProject(Long id) {
    Project project = projectRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Projeto não encontrado: " + id));
    project.updateDatesAndStatus();
    project.cancelProject();
    Project saved = projectRepository.save(project);

    projectActivityHandler.cancelled(SecurityUtils.getCurrentUser(), saved);

    return toResponseDTO(saved);
  }

  // atualizar nome e descriçao
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

  // criar projeto com template
  @Transactional
  public ProjectResponseDTO createFromTemplate(ProjectCreateFromTemplateDTO dto) {

    // Criação do projeto base
    Project project = new Project();
    project.setName(dto.name());
    project.setDescription(dto.description());
    projectRepository.save(project);

    // Criar fases a partir dos templates
    List<Phase> createdPhases = phaseService.createPhasesFromTemplate(
        project.getId(),
        dto.estimatedStartDate(),
        dto.phaseTemplateIds());
    project.setPhases(createdPhases);
    projectRepository.save(project);

    // vincula o criador como ADMIN
    Long currentUserId = SecurityUtils.getCurrentUser().getId();
    UserProjectRequestDTO adminUserDto = new UserProjectRequestDTO(
        currentUserId,
        project.getId(),
        UserRole.ADMIN);
    userProjectService.assignUserToProject(adminUserDto);

    // 2. Vincula os demais usuários vindos do DTO (se houver)
    if (dto.userProjects() != null && !dto.userProjects().isEmpty()) {
      for (UserProjectRequestDTO up : dto.userProjects()) {
        // Evita duplicar o criador
        if (!up.userId().equals(currentUserId)) {
          UserProjectRequestDTO userProjectDto = new UserProjectRequestDTO(
              up.userId(),
              project.getId(),
              up.role());
          userProjectService.assignUserToProject(userProjectDto);
        }
      }
    }

    project.updateDatesAndStatus();
    return toResponseDTO(projectRepository.save(project));
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
