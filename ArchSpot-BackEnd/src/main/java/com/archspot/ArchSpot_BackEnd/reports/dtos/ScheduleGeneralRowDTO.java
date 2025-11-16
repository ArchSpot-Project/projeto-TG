package com.archspot.ArchSpot_BackEnd.reports.dtos;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleGeneralRowDTO {
  private Long projectId;
  private String projectName;
  private String status;
  private Integer percentComplete;
  private Integer percentPaid;

  private LocalDate estimatedStartDate;
  private LocalDate estimatedEndDate;
  private LocalDate realStartDate;
  private LocalDate realEndDate;
}
