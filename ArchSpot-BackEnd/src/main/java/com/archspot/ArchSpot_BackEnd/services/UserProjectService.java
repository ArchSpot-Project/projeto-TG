package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.activities.services.handlers.UserProjectActivityHandler;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.entities.*;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.exceptions.AssociationNotFoundException;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.exceptions.UnauthorizedException;
import com.archspot.ArchSpot_BackEnd.repositories.*;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserProjectService {

  @Autowired
  private UserProjectRepository userProjectRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private UserProjectActivityHandler userProjectActivityHandler;

  @Transactional(readOnly = true)
  public List<UserProjectResponseDTO> getAll() {
    return userProjectRepository.findAll().stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<UserProjectResponseDTO> getByProject(Long projectId) {
    return userProjectRepository.findByProjectId(projectId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<UserProjectResponseDTO> getByUser(Long userId) {
    return userProjectRepository.findByUserId(userId).stream()
        .map(this::toResponseDTO)
        .toList();
  }

  @Transactional
  public UserProjectResponseDTO assignUserToProject(UserProjectRequestDTO dto) {
    User user = userRepository.findById(dto.userId())
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + dto.userId()));

    Project project = projectRepository.findById(dto.projectId())
        .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + dto.projectId()));

    // verifica se é o primeiro membro associado (libera para criar o ADMIN)
    boolean isFirstMember = userProjectRepository.findByProjectId(project.getId()).isEmpty();

    if (!isFirstMember) {
      Long currentUserId = SecurityUtils.getCurrentUserId();
      UserProject currentUserLink = userProjectRepository.findByUserIdAndProjectId(currentUserId, project.getId())
          .orElseThrow(() -> new UnauthorizedException("You are not a member of this project"));

      // verifica se user atual é ADMIN (permissão para gerenciar membros)
      if (currentUserLink.getRole() != UserRole.ADMIN) {
        throw new UnauthorizedException("Only ADMIN users can manage project members");
      }
    }

    // evita duplicação: se existir, atualiza role
    var existing = userProjectRepository.findByUserIdAndProjectId(user.getId(), project.getId());
    UserProject entity;

    boolean isNew = false;
    UserRole oldRole = null;

    if (existing.isPresent()) {
      entity = existing.get();
      oldRole = entity.getRole();
      entity.setRole(dto.role());
    } else {
      isNew = true;
      entity = new UserProject();
      entity.setUser(user);
      entity.setProject(project);
      entity.setRole(dto.role());
    }
    UserProject saved = userProjectRepository.save(entity);

    if (isNew) {
      userProjectActivityHandler.assigned(
          SecurityUtils.getCurrentUser(),
          project,
          user,
          dto.role());
    } else if (oldRole != dto.role()) {
      userProjectActivityHandler.roleUpdated(
          SecurityUtils.getCurrentUser(),
          project,
          user,
          oldRole,
          dto.role());
    }
    return toResponseDTO(saved);
  }

  @Transactional
  public void removeUserFromProject(Long userId, Long projectId) {
    var association = userProjectRepository.findByUserIdAndProjectId(userId, projectId)
        .orElseThrow(() -> new AssociationNotFoundException(userId, projectId));

    User removedUser = association.getUser();
    Project project = association.getProject();

    userProjectRepository.delete(association);

    userProjectActivityHandler.removed(
        SecurityUtils.getCurrentUser(),
        project,
        removedUser);
  }

  private UserProjectResponseDTO toResponseDTO(UserProject entity) {
    return new UserProjectResponseDTO(
        entity.getId(),
        entity.getUser().getId(),
        entity.getUser().getName(),
        entity.getProject().getId(),
        entity.getProject().getName(),
        entity.getRole());
  }
}
