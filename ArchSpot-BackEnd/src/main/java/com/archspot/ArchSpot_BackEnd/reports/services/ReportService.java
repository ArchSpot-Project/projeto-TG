package com.archspot.ArchSpot_BackEnd.reports.services;

import com.archspot.ArchSpot_BackEnd.reports.dtos.ReportFilterDTO;
import com.archspot.ArchSpot_BackEnd.reports.dtos.ReportResponseDTO;

public interface ReportService {
  ReportResponseDTO<?> generateReport(ReportFilterDTO filters);
}
