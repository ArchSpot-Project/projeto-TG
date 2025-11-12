package com.archspot.ArchSpot_BackEnd.dtos.phase;

import java.time.LocalDate;

public record PhaseCreateAllDTO(
    String name,
    String description,
    LocalDate estimatedStartDate,
    LocalDate estimatedEndDate,
    Integer duration,
    Long previousPhaseId,
    Long projectId
) {}