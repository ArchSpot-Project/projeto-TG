package com.archspot.ArchSpot_BackEnd.reports.dtos;

import java.time.LocalDate;

import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.ProjectStatus;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportFilterDTO {

  private String reportType;

  // filtros opcionais
  private LocalDate startDate;
  private LocalDate endDate;

  private Long projectId;
  private UserRole userRole;

  private ProjectStatus projectStatus;
  private PaymentMethod paymentMethod;

  public boolean hasAnyDate() {
    return startDate != null || endDate != null;
  }

}
