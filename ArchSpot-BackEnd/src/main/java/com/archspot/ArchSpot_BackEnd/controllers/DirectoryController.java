package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import com.archspot.ArchSpot_BackEnd.services.DirectoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/directories")
@CrossOrigin(origins = "http://localhost:4200")
public class DirectoryController {

  @Autowired
  private DirectoryService directoryService;

  @GetMapping("/project/{projectId}")
  public List<DirectoryDTO> getByProject(
      @PathVariable Long projectId,
      @RequestParam(required = false) DirectoryType type) {
    return directoryService.findByProjectAndType(projectId, type);
  }

  @PostMapping
  public DirectoryDTO create(@RequestBody DirectoryCreateDTO dto) {
    return directoryService.createDirectory(dto);
  }

  @PutMapping("/{id}")
  public DirectoryDTO update(@PathVariable Long id, @RequestBody DirectoryCreateDTO dto) {
    return directoryService.updateDirectory(id, dto);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id) {
    directoryService.delete(id);
  }
}
