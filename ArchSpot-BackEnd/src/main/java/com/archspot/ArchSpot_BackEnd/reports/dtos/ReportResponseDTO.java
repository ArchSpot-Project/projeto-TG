package com.archspot.ArchSpot_BackEnd.reports.dtos;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportResponseDTO<T> {

  private String reportType;
  private List<T> rows;

  public ReportResponseDTO(String reportType, List<T> rows) {
    this.reportType = reportType;
    this.rows = rows;
  }

}
