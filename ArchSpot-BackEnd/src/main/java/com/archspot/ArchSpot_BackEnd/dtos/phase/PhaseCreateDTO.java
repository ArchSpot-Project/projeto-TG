package com.archspot.ArchSpot_BackEnd.dtos.phase;

public record PhaseCreateDTO(
    Long phaseTemplateId,
    Integer estimatedDurationDays
) {}
