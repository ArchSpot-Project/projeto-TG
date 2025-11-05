package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.services.UserProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-projects")
public class UserProjectController {
  
  /*
   * Esse controller pode ser eliminado futuramente!
   * Os métodos estão aninhados em ProjectController
   * Mantendo aqui só para eventuais testes e conferêcias...
   */

  @Autowired
  private UserProjectService userProjectService;

  @GetMapping
  public ResponseEntity<List<UserProjectResponseDTO>> getAll() {
    return ResponseEntity.ok(userProjectService.getAll());
  }

  @PostMapping // migrado para projects (POST /projects/{projectId}/users/{userId}?role=STAFF) 
  public ResponseEntity<UserProjectResponseDTO> assign(@RequestBody UserProjectRequestDTO dto) {
    var saved = userProjectService.assignUserToProject(dto);
    return ResponseEntity.ok(saved);
  }

  @DeleteMapping // migrado para projects (DELETE /projects/{projectId}/users/{userId})
  public ResponseEntity<Void> remove(@RequestParam Long userId, @RequestParam Long projectId) {
    userProjectService.removeUserFromProject(userId, projectId);
    return ResponseEntity.noContent().build();
  }
}
