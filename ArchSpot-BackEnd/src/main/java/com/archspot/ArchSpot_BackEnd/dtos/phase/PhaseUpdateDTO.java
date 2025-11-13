package com.archspot.ArchSpot_BackEnd.dtos.phase;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.archspot.ArchSpot_BackEnd.enums.PhaseStatus;

public record PhaseUpdateDTO(
    String name,
    String description,
    LocalDate estimatedStartDate,
    LocalDate estimatedEndDate,
    LocalDateTime realStartDate,
    LocalDateTime realEndDate,
    Integer duration,
    Long previousPhaseId,
    PhaseStatus status) {
}
