package com.archspot.ArchSpot_BackEnd.dtos.project;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.archspot.ArchSpot_BackEnd.enums.ProjectStatus;

import lombok.Data;

@Data
public class ProjectRequestDTO {
    private String name;
    private LocalDate estimatedStartDate;
    private LocalDate estimatedEndDate;
    private String description;
    private BigDecimal totalValue;
    private ProjectStatus status;
}
