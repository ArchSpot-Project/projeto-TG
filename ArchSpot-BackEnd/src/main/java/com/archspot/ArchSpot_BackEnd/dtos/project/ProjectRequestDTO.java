package com.archspot.ArchSpot_BackEnd.dtos.project;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ProjectRequestDTO {
    private String name;
    private String description;
    private BigDecimal totalValue;
}
