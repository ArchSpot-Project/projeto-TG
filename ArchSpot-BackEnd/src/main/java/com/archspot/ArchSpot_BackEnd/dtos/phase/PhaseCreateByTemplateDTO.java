package com.archspot.ArchSpot_BackEnd.dtos.phase;

public record PhaseCreateByTemplateDTO(
    Long phaseTemplateId,
    Integer estimatedDurationDays
) {}
