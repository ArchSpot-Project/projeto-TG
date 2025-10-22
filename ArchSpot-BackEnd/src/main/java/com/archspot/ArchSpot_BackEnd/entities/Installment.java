package com.archspot.ArchSpot_BackEnd.entities;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "tb_installment")
@Data
public class Installment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull(message = "Data estimada de pagamento não pode ser nula")
  private LocalDate estimatedPaymentDate;
  private LocalDate realPaymentDate;

  @Enumerated(EnumType.STRING)
  private PaymentMethod paymentMethod;

  @Enumerated(EnumType.STRING)
  private PaymentStatus paymentStatus;

  @Column(precision = 12, scale = 2, nullable = false)
  @NotNull(message = "Valor da parcela não pode ser nulo")
  private BigDecimal amount;

  private String description;

  @ManyToOne
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  // construtores
  public Installment() {
  }

  public Installment(Project project,
      LocalDate estimatedPaymentDate,
      BigDecimal amount,
      PaymentMethod paymentMethod,
      PaymentStatus paymentStatus,
      String description) {
    this.project = project;
    this.estimatedPaymentDate = estimatedPaymentDate;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.paymentStatus = paymentStatus != null ? paymentStatus : PaymentStatus.PENDING;
    this.description = description;
    project.getInstallments().add(this);
  }

  /*
   * métodos de negócio
   */

  // verifica se uma parcela está atrasada (Pendente + data estimada já passou)
  public boolean isOverdue() {
    return this.paymentStatus == PaymentStatus.PENDING &&
        this.estimatedPaymentDate.isBefore(LocalDate.now());
  }

  // altera uma parcela para paga, seta metodo e data real de pagamento
  public void pay(PaymentMethod method) {
    this.paymentMethod = method;
    this.paymentStatus = PaymentStatus.PAID;
    this.realPaymentDate = LocalDate.now();
  }

  // altera uma pacela para atrasada (chamada pelo service quando apropriado)
  public void updateOverdueStatus() {
    if (this.isOverdue()) {
      this.paymentStatus = PaymentStatus.OVERDUE;
    }
  }

}
