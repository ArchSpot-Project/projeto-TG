package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.services.UserProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-projects")
@CrossOrigin(origins = "http://localhost:4200")
public class UserProjectController {

  @Autowired
  private UserProjectService userProjectService;

  @GetMapping
  public ResponseEntity<List<UserProjectResponseDTO>> getAll() {
    return ResponseEntity.ok(userProjectService.getAll());
  }

  @PostMapping // no futuro migrar para projects (p. ex.: POST /projects/{projectId}/users/{userId}?role=STAFF) 
  public ResponseEntity<UserProjectResponseDTO> assign(@RequestBody UserProjectRequestDTO dto) {
    var saved = userProjectService.assignUserToProject(dto);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping // no futuro migrar para projects (p. ex.: DELETE /projects/{projectId}/users/{userId})
  public ResponseEntity<Void> remove(@RequestParam Long userId, @RequestParam Long projectId) {
    userProjectService.removeUserFromProject(userId, projectId);
    return ResponseEntity.noContent().build();
  }
}
