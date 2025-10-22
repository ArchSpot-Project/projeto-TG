package com.archspot.ArchSpot_BackEnd.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.archspot.ArchSpot_BackEnd.entities.Installment;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Long> {

    // buscar todas as parcelas de um projeto
    List<Installment> findByProjectId(Long projectId);

    // buscar todas parcelas de um projeto com um status
    List<Installment> findByProjectIdAndPaymentStatus(Long projectId, PaymentStatus paymentStatus);
}