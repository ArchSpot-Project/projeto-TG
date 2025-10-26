package com.archspot.ArchSpot_BackEnd.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PhaseDTO(
    Long id,
    String name,
    String description,
    LocalDate estimatedStartDate,
    LocalDate estimatedEndDate,
    LocalDateTime realStartDate,
    LocalDateTime realEndDate,
    Integer duration,
    Long previousPhaseId,
    Long projectId,
    String status
) {}