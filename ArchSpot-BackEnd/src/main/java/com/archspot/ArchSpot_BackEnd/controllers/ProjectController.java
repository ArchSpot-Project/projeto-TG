package com.archspot.ArchSpot_BackEnd.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.archspot.ArchSpot_BackEnd.dtos.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.ProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.ProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.services.PhaseService;
import com.archspot.ArchSpot_BackEnd.services.ProjectService;
import com.archspot.ArchSpot_BackEnd.services.UserProjectService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @Autowired
  private PhaseService phaseService;

  @Autowired
  private UserProjectService userProjectService;

  @GetMapping
  public ResponseEntity<List<ProjectResponseDTO>> getAll() {
    return ResponseEntity.ok(projectService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProjectResponseDTO> getById(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.findById(id));
  }

  // endpoint para recuperar tudas as fases de um projeto
  @GetMapping("/{projectId}/phases")
  public ResponseEntity<List<PhaseDTO>> getPhasesByProject(@PathVariable Long projectId) {
    List<PhaseDTO> phases = phaseService.findByProject(projectId);
    return ResponseEntity.ok(phases);
  }

  // endpoint para recuperar usuários em um projeto
  @GetMapping("/{projectId}/users")
  public ResponseEntity<List<UserProjectResponseDTO>> getUsersByProject(@PathVariable Long projectId) {
    return ResponseEntity.ok(userProjectService.getByProject(projectId));
  }

  // associa usuário a projeto (p.ex.: endpoint + ?role=STAFF)
  @PostMapping("/{projectId}/users/{userId}")
  public ResponseEntity<UserProjectResponseDTO> assignUserToProject(
      @PathVariable Long projectId,
      @PathVariable Long userId,
      @RequestParam String role) {

    UserProjectRequestDTO dto = new UserProjectRequestDTO(userId, projectId, UserRole.valueOf(role.toUpperCase()));

    var assigned = userProjectService.assignUserToProject(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(assigned);
  }

  // remove usuário de projeto
  @DeleteMapping("/{projectId}/users/{userId}")
  public ResponseEntity<Void> removeUserFromProject(
      @PathVariable Long projectId,
      @PathVariable Long userId) {

    userProjectService.removeUserFromProject(userId, projectId);
    return ResponseEntity.noContent().build();
  }

  @PostMapping
  public ResponseEntity<ProjectResponseDTO> create(@RequestBody @Valid ProjectRequestDTO dto) {
    return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(dto));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ProjectResponseDTO> update(@PathVariable Long id, @RequestBody @Valid ProjectRequestDTO dto) {
    return ResponseEntity.ok(projectService.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    projectService.delete(id);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{id}/finalize")
  public ResponseEntity<ProjectResponseDTO> finalizeProject(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.finalizeProject(id));
  }

  @PostMapping("/{id}/cancel")
  public ResponseEntity<ProjectResponseDTO> cancelProject(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.cancelProject(id));
  }
}
