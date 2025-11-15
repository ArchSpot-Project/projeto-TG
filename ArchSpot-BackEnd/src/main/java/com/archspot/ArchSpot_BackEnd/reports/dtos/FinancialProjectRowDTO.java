package com.archspot.ArchSpot_BackEnd.reports.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FinancialProjectRowDTO {
  private Long installmentId;
  private String description;

  private String status; // pago / pendente
  private BigDecimal value;
  private String paymentMethod;

  private LocalDate estimatedPaymentDate;
  private LocalDate realPaymentDate;
}
