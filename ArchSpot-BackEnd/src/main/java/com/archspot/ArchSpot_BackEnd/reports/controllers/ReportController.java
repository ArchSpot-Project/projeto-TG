package com.archspot.ArchSpot_BackEnd.reports.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.archspot.ArchSpot_BackEnd.reports.dtos.ReportFilterDTO;
import com.archspot.ArchSpot_BackEnd.reports.services.ReportService;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody ReportFilterDTO filters) {
        return ResponseEntity.ok(reportService.generateReport(filters));
    }
}
