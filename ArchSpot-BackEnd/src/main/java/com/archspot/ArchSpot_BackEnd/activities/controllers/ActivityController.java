package com.archspot.ArchSpot_BackEnd.activities.controllers;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.archspot.ArchSpot_BackEnd.activities.dtos.ActivityResponseDTO;
import com.archspot.ArchSpot_BackEnd.activities.services.ActivityService;
import com.archspot.ArchSpot_BackEnd.activities.services.utils.ActivityMapper;

import java.util.List;

@RestController
@RequestMapping("/projects/{projectId}/activities")
public class ActivityController {

    @Autowired
    private ActivityService service;

    @Autowired
    private ActivityMapper mapper;

    @GetMapping
    public List<ActivityResponseDTO> getActivities(@PathVariable Long projectId) {
        return service.getActivitiesByProject(projectId)
                .stream()
                .map(mapper::toDTO)
                .toList();
    }
}
