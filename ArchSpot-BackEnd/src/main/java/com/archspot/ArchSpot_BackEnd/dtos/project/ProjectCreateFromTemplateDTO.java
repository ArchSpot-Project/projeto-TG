package com.archspot.ArchSpot_BackEnd.dtos.project;

import java.time.LocalDate;
import java.util.List;

import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseCreateByTemplateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectRequestDTO;

import jakarta.validation.constraints.NotBlank;

public record ProjectCreateFromTemplateDTO(
    @NotBlank String name,
    String description,
    LocalDate estimatedStartDate,
    List<PhaseCreateByTemplateDTO> phaseTemplateIds,     // opcional
    List<UserProjectRequestDTO> userProjects  // opcional (userId + role)
) {}
