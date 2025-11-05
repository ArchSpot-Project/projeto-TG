package com.archspot.ArchSpot_BackEnd.dtos.installment;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;

public record InstallmentRequestDTO(
    LocalDate estimatedPaymentDate,
    LocalDate realPaymentDate,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    BigDecimal amount,
    String description,
    Long projectId) {
}