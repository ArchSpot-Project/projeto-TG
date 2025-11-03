package com.archspot.ArchSpot_BackEnd.dtos.phase;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PhaseCreateDTO(
    String name,
    String description,
    LocalDate estimatedStartDate,
    LocalDate estimatedEndDate,
    LocalDateTime realStartDate,
    LocalDateTime realEndDate,
    Integer duration,
    Long previousPhaseId,
    Long projectId
) {}