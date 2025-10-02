package com.archspot.ArchSpot_BackEnd.dtos;

import java.time.LocalDate;

public record PhaseCreateDTO(
    String name,
    String description,
    LocalDate estimatedStartDate,
    LocalDate estimatedEndDate,
    LocalDate realStartDate,
    LocalDate realEndDate,
    Integer duration,
    Long previousPhaseId,
    Long projectId
) {}