package com.archspot.ArchSpot_BackEnd.reports.dtos;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FinancialGeneralRowDTO {
  private Long projectId;
  private String projectName;
  private String status;

  private BigDecimal totalValue;
  private BigDecimal totalPaid;
  private BigDecimal totalRemaining;
}
