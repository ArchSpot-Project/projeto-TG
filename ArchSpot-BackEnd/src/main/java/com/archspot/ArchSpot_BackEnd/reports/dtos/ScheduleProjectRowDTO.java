package com.archspot.ArchSpot_BackEnd.reports.dtos;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleProjectRowDTO {
  private Long phaseId;
  private String phaseName;
  private String status;
  private Integer percentComplete;

  private LocalDate estimatedStartDate;
  private LocalDate estimatedEndDate;
  private LocalDate realStartDate;
  private LocalDate realEndDate;
}
