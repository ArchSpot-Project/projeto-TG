package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.entities.*;
import com.archspot.ArchSpot_BackEnd.repositories.*;

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

  /*
    TODO Validações: adicionar checagens (p.ex. somente project admin pode adicionar/alterar membros). 
    ou via @PreAuthorize quando integrar Spring Security.
  */
  @Transactional
  public UserProjectResponseDTO assignUserToProject(UserProjectRequestDTO dto) {
    User user = userRepository.findById(dto.userId())
        .orElseThrow(() -> new RuntimeException("User not found"));
    Project project = projectRepository.findById(dto.projectId())
        .orElseThrow(() -> new RuntimeException("Project not found"));

    // evita duplicação: se existir, atualiza role
    var existing = userProjectRepository.findByUserIdAndProjectId(user.getId(), project.getId());
    UserProject entity;
    if (existing.isPresent()) {
      entity = existing.get();
      entity.setRole(dto.role());
    } else {
      entity = new UserProject();
      entity.setUser(user);
      entity.setProject(project);
      entity.setRole(dto.role());
    }
    userProjectRepository.save(entity);
    return toResponseDTO(entity);
  }

  @Transactional
  public void removeUserFromProject(Long userId, Long projectId) {
    var association = userProjectRepository.findByUserIdAndProjectId(userId, projectId)
        .orElseThrow(() -> new RuntimeException(
            "Association between user " + userId + " and project " + projectId + " not found."));

    userProjectRepository.delete(association);
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
