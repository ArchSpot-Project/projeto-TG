
package com.archspot.ArchSpot_BackEnd.controllers;

import java.net.URI;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.archspot.ArchSpot_BackEnd.dtos.PhaseCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.enums.PhaseStatus;
import com.archspot.ArchSpot_BackEnd.services.PhaseService;

@RestController
@RequestMapping(value = "/project-phases")
@CrossOrigin(origins = "http://localhost:4200")
public class PhaseController {

  @Autowired
  private PhaseService service;

  @GetMapping
  public ResponseEntity<List<PhaseDTO>> findAll() {
    return ResponseEntity.ok(service.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<PhaseDTO> findById(@PathVariable Long id) {
    return ResponseEntity.ok(service.findById(id));
  }

  @PostMapping
  public ResponseEntity<PhaseDTO> create(@RequestBody PhaseCreateDTO dto) {
    PhaseDTO saved = service.create(dto);
    URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(saved.id())
        .toUri();
    return ResponseEntity.created(uri).body(saved);
  }

  @PutMapping("/{id}")
  public ResponseEntity<PhaseDTO> update(@PathVariable Long id,
      @RequestBody PhaseCreateDTO dto) {
    return ResponseEntity.ok(service.update(id, dto));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/start")
  public ResponseEntity<PhaseDTO> startPhase(@PathVariable Long id) {
    return ResponseEntity.ok(service.startPhase(id));
  }

  @PutMapping("/{id}/finish")
  public ResponseEntity<PhaseDTO> finishPhase(@PathVariable Long id) {
    return ResponseEntity.ok(service.finishPhase(id));
  }

  @GetMapping("/phase-status")
  public ResponseEntity<List<String>> getPhaseStatus() {
    List<String> phaseStatus = Arrays.stream(PhaseStatus.values())
        .map(Enum::name)
        .toList();
    return ResponseEntity.ok(phaseStatus);
  }
}
