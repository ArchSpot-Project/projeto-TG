package com.archspot.ArchSpot_BackEnd.controllers;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import java.util.Map;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.archspot.ArchSpot_BackEnd.dtos.AlbumCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.AlbumDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.dtos.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.ProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.ProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.services.AlbumService;
import com.archspot.ArchSpot_BackEnd.services.DirectoryService;
import com.archspot.ArchSpot_BackEnd.services.InstallmentService;
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

  @Autowired
  private ProjectService projectService;

  @Autowired
  private PhaseService phaseService;

  @Autowired
  private UserProjectService userProjectService;

  @Autowired
  private InstallmentService installmentService;

  @Autowired
  private DirectoryService directoryService;

  @Autowired
  private AlbumService albumService;

  /*
   * CRUD BÁSICO DE PROJETO
   */

  @GetMapping
  public ResponseEntity<List<ProjectResponseDTO>> getAll() {
    return ResponseEntity.ok(projectService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProjectResponseDTO> getById(@PathVariable Long id) {
    return ResponseEntity.ok(projectService.findById(id));
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

  @PatchMapping("/{id}")
  public ResponseEntity<ProjectResponseDTO> updateTitleAndDescription(
      @PathVariable Long id,
      @RequestBody Map<String, String> updates) {
    ProjectResponseDTO updatedProject = projectService.updateTitleAndDescription(id, updates);
    return ResponseEntity.ok(updatedProject);
  }

  /*
   * ENDPOINTS PARA FASES
   */

  // recuperar tudas as fases de um projeto
  @GetMapping("/{projectId}/phases")
  public ResponseEntity<List<PhaseDTO>> getPhasesByProject(@PathVariable Long projectId) {
    List<PhaseDTO> phases = phaseService.findByProject(projectId);
    return ResponseEntity.ok(phases);
  }

  /*
   * ENDPOINTS PARA ASSOCIAÇÃO USUÁRIO-PROJETO
   */

  // recuperar usuários em um projeto
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

  /*
   * ENDPOINTS PARA PARCELAS
   */

  // Listar todas as parcelas do projeto (ou filtrar por status p. ex.: "endpoint
  // + ?status=PENDING")
  @GetMapping("/{projectId}/installments")
  public ResponseEntity<List<InstallmentResponseDTO>> getInstallmentsByProject(
      @PathVariable Long projectId,
      @RequestParam(required = false) String status) {

    if (status == null) {
      return ResponseEntity.ok(installmentService.findByProject(projectId));
    }

    try {
      PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
      return ResponseEntity.ok(installmentService.findByProjectAndStatus(projectId, paymentStatus));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value: " + status);
    }
  }

  // Totais financeiros por projeto (ou filtrar por status p. ex.: "endpoint +
  // ?status=PENDING")
  @GetMapping("/{projectId}/installments/total")
  public ResponseEntity<BigDecimal> getTotal(
      @PathVariable Long projectId,
      @RequestParam(required = false) String status) {

    if (status == null) {
      return ResponseEntity.ok(installmentService.getTotalByProject(projectId));
    }

    try {
      PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
      return ResponseEntity.ok(installmentService.getTotalByProjectAndStatus(projectId, paymentStatus));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value: " + status);
    }
  }

  /*
   * ENDPOINTS DE DIRETORIOS
   */

  // Buscar diretório por projeto (PARAM: ?type=DRAWINGS ou DOCUMENTS)
  @GetMapping("/{projectId}/directories")
  public ResponseEntity<List<DirectoryDTO>> getDirectoriesByProject(
      @PathVariable Long projectId,
      @RequestParam(required = false) DirectoryType type) {
    List<DirectoryDTO> directories = directoryService.findByProjectAndType(projectId, type);
    return ResponseEntity.ok(directories);
  }

  // Criar diretório de primeiro nível em um projeto
  @PostMapping("/{projectId}/directories")
  public ResponseEntity<DirectoryDTO> createDirectoryInProject(
      @PathVariable Long projectId,
      @RequestBody DirectoryCreateDTO dto) {
    dto.setProjectId(projectId);
    dto.setParentDirectoryId(null); // primeiro nível, sem diretório pai
    DirectoryDTO created = directoryService.createDirectory(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // Deletar diretório e Update são atribuições do DirectoryController

  /*
   * ENDPOINTS DE ÁLBUNS
   */

  // listar por projeto
  @GetMapping("/{projectId}/albums")
  public ResponseEntity<List<AlbumDTO>> getAlbumsByProject(@PathVariable Long projectId) {
    return ResponseEntity.ok(albumService.findByProject(projectId));
  }

  // criar álbum
  @PostMapping("/{projectId}/albums")
  public ResponseEntity<AlbumDTO> createAlbum(
      @PathVariable Long projectId,
      @RequestBody AlbumCreateDTO dto) {
    dto.setProjectId(projectId);
    AlbumDTO created = albumService.createAlbum(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  // Deletar álbum e Update são atribuições do AlbumController

}
