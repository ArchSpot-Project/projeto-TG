package com.archspot.ArchSpot_BackEnd.templates.controllers;

import com.archspot.ArchSpot_BackEnd.templates.dtos.ProjectTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.dtos.PhaseTemplateDTO;
import com.archspot.ArchSpot_BackEnd.templates.services.TemplateService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/templates")
public class TemplateController {

  private final TemplateService templateService;

  public TemplateController(TemplateService templateService) {
    this.templateService = templateService;
  }

  // === Project Templates ===
  @GetMapping("/project")
  public ResponseEntity<List<ProjectTemplateDTO>> listProjectTemplates() {
    List<ProjectTemplateDTO> templates = templateService.findAllProjectTemplates();
    return ResponseEntity.ok(templates);
  }

  @GetMapping("/project/{id}")
  public ResponseEntity<ProjectTemplateDTO> getProjectTemplate(@PathVariable Long id) {
    ProjectTemplateDTO dto = templateService.findProjectTemplateById(id);
    return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
  }

  @PostMapping("/project")
  public ResponseEntity<ProjectTemplateDTO> createProjectTemplate(
      @RequestBody ProjectTemplateDTO dto) {
    ProjectTemplateDTO created = templateService.saveProjectTemplate(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/project/{id}")
  public ResponseEntity<ProjectTemplateDTO> updateProjectTemplate(
      @PathVariable Long id,
      @RequestBody ProjectTemplateDTO dto) {
    ProjectTemplateDTO updated = templateService.updateProjectTemplate(id, dto);
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/project/{id}")
  public ResponseEntity<Void> deleteProjectTemplate(@PathVariable Long id) {
    templateService.deleteProjectTemplate(id);
    return ResponseEntity.noContent().build();
  }

  // === Phase Templates ===
  @GetMapping("/phase")
  public ResponseEntity<List<PhaseTemplateDTO>> listPhaseTemplates() {
    List<PhaseTemplateDTO> templates = templateService.findAllPhaseTemplates();
    return ResponseEntity.ok(templates);
  }

  @PostMapping("/phase")
  public ResponseEntity<PhaseTemplateDTO> createPhaseTemplate(
      @RequestBody PhaseTemplateDTO dto) {
    PhaseTemplateDTO created = templateService.savePhaseTemplate(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/phase/{id}")
  public ResponseEntity<PhaseTemplateDTO> updatePhaseTemplate(
      @PathVariable Long id,
      @RequestBody PhaseTemplateDTO dto) {
    PhaseTemplateDTO updated = templateService.updatePhaseTemplate(id, dto);
    return ResponseEntity.ok(updated);
  }

  @DeleteMapping("/phase/{id}")
  public ResponseEntity<Void> deletePhaseTemplate(@PathVariable Long id) {
    templateService.deletePhaseTemplate(id);
    return ResponseEntity.noContent().build();
  }
}
