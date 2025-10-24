package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.DirectoryCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.DirectoryDTO;
import com.archspot.ArchSpot_BackEnd.services.DirectoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/directories")
public class DirectoryController {

    @Autowired
    private DirectoryService directoryService;

    @PostMapping
    public DirectoryDTO create(@RequestBody DirectoryCreateDTO dto) {
        return directoryService.createDirectory(dto);
    }

    @GetMapping("/project/{projectId}")
    public List<DirectoryDTO> getByProject(@PathVariable Long projectId) {
        return directoryService.getDirectoriesByProject(projectId);
    }
}
