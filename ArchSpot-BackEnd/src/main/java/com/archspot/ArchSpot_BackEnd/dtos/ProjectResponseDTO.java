package com.archspot.ArchSpot_BackEnd.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.archspot.ArchSpot_BackEnd.enums.Status;

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
    private LocalDate realStartDate;
    private LocalDate realEndDate;
    private String description;
    private BigDecimal totalValue;
    private Status status;
    private List<PhaseDTO> phases;
}
