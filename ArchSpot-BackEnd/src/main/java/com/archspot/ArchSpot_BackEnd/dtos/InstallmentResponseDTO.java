package com.archspot.ArchSpot_BackEnd.dtos;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;

public record InstallmentResponseDTO(
    Long id,
    LocalDate estimatedPaymentDate,
    LocalDate realPaymentDate,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    BigDecimal amount,
    String description,
    Long projectId) {}
