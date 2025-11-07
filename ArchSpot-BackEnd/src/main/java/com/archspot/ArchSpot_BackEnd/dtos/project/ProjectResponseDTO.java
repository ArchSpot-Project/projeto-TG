package com.archspot.ArchSpot_BackEnd.dtos.project;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.archspot.ArchSpot_BackEnd.dtos.installment.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.dtos.phase.PhaseDTO;
import com.archspot.ArchSpot_BackEnd.enums.ProjectStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProjectResponseDTO {
    private Long id;
    private String name;
    private LocalDate estimatedStartDate;
    private LocalDate estimatedEndDate;
    private LocalDateTime realStartDate;
    private LocalDateTime realEndDate;
    private String description;
    private BigDecimal totalValue;
    private ProjectStatus status;
    private List<PhaseDTO> phases;
    private List<InstallmentResponseDTO> installments;
}
