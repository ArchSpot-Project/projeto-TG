package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.InstallmentRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.entities.Installment;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;
import com.archspot.ArchSpot_BackEnd.repositories.InstallmentRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@Service
public class InstallmentService {

  @Autowired
  private InstallmentRepository installmentRepository;

  @Autowired
  private ProjectRepository projectRepository;

  /*
   * CRUD BÁSICO
   */

  // buscar por projeto
  @Transactional(readOnly = true)
  public List<InstallmentResponseDTO> findByProject(Long projectId) {
    refreshOverdueStatuses(projectId);
    List<Installment> installments = installmentRepository.findByProjectId(projectId);
    return installments.stream().map(this::toDTO).collect(Collectors.toList());
  }

  // buscar por ID
  @Transactional(readOnly = true)
  public InstallmentResponseDTO findById(Long id) {
    Installment installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Installment not found"));

    Long projectId = installment.getProject().getId();
    refreshOverdueStatuses(projectId);
    // Garante que a parcela retornada está atualizada após o refresh
    installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Installment not found"));

    return toDTO(installment);
  }

  // buscar todos
  @Transactional(readOnly = true)
  public List<InstallmentResponseDTO> findAll() {
    refreshAllOverdueStatuses();
    return installmentRepository.findAll().stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // criar parcela
  @Transactional
  public InstallmentResponseDTO create(InstallmentRequestDTO dto) {
    Project project = projectRepository.findById(dto.projectId())
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Project not found"));

    Installment installment = new Installment();
    installment.setProject(project);
    installment.setEstimatedPaymentDate(dto.estimatedPaymentDate());
    installment.setRealPaymentDate(dto.realPaymentDate());
    installment.setPaymentMethod(dto.paymentMethod());
    installment.setPaymentStatus(dto.paymentStatus() != null ? dto.paymentStatus() : PaymentStatus.PENDING);
    installment.setAmount(dto.amount());
    installment.setDescription(dto.description());

    installmentRepository.save(installment);
    updateProjectTotal(installment.getProject().getId());
    return toDTO(installment);
  }

  // atualizar parcela
  @Transactional
  public InstallmentResponseDTO update(Long id, InstallmentRequestDTO dto) {
    Installment installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Installment not found"));

    installment.setEstimatedPaymentDate(dto.estimatedPaymentDate());
    installment.setRealPaymentDate(dto.realPaymentDate());
    installment.setPaymentMethod(dto.paymentMethod());
    installment.setPaymentStatus(dto.paymentStatus());
    installment.setAmount(dto.amount());
    installment.setDescription(dto.description());

    installmentRepository.save(installment);
    updateProjectTotal(installment.getProject().getId());
    return toDTO(installment);
  }

  // deletar parcela
  @Transactional
  public void delete(Long id) {
    Installment installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Installment not found"));

    installmentRepository.delete(installment);
    updateProjectTotal(installment.getProject().getId());
  }

  /*
   * REGRAS DE NEGÓCIO
   */

  // Listar por status
  @Transactional
  public List<InstallmentResponseDTO> findByProjectAndStatus(Long projectId, PaymentStatus status) {
    refreshOverdueStatuses(projectId);
    List<Installment> installments = installmentRepository.findByProjectIdAndPaymentStatus(projectId, status);
    return installments.stream().map(this::toDTO).collect(Collectors.toList());
  }

  // Verifica se está atrasada
  @Transactional(readOnly = true)
  public boolean isOverdue(Long id) {
    Installment installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Installment not found"));
    return installment.isOverdue();
  }

  // Soma total por projeto
  @Transactional(readOnly = true)
  public BigDecimal getTotalByProject(Long projectId) {
    return installmentRepository.findByProjectId(projectId).stream()
        .map(Installment::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  // soma total por projeto e status
  @Transactional(readOnly = true)
  public BigDecimal getTotalByProjectAndStatus(Long projectId, PaymentStatus status) {
    refreshOverdueStatuses(projectId);
    return installmentRepository.findByProjectId(projectId).stream()
        .filter(i -> i.getPaymentStatus() == status)
        .map(Installment::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }

  // Pagar parcela
  @Transactional
  public InstallmentResponseDTO payInstallment(Long id, PaymentMethod method) {
    Installment installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Installment not found"));

    installment.pay(method);
    installmentRepository.save(installment);
    return toDTO(installment);
  }

  // cancelar parcela
  @Transactional
  public InstallmentResponseDTO cancelInstallment(Long id) {
    Installment installment = installmentRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Installment not found"));

    installment.setPaymentStatus(PaymentStatus.CANCELED);
    installmentRepository.save(installment);

    return toDTO(installment);
  }

  /*
   * MÉTODOS AUXILIARES
   */

  // Atualiza status para ODERDUE (atrasado) quando apropriado (executado antes de
  // cálculos/listagens)
  @Transactional
  public void refreshOverdueStatuses(Long projectId) {
    List<Installment> installments = installmentRepository.findByProjectId(projectId);
    boolean dirty = false;
    for (Installment i : installments) {
      if (i.isOverdue() && i.getPaymentStatus() == PaymentStatus.PENDING) {
        i.updateOverdueStatus();
        dirty = true;
      }
    }
    if (dirty) {
      installmentRepository.saveAll(installments);
    }
  }

  // Atualiza todos os status para ODERDUE (atrasado) quando apropriado (executado
  // em listagem geral)
  @Transactional
  public void refreshAllOverdueStatuses() {
    List<Installment> installments = installmentRepository.findAll();
    boolean dirty = false;
    for (Installment i : installments) {
      if (i.isOverdue() && i.getPaymentStatus() == PaymentStatus.PENDING) {
        i.updateOverdueStatus();
        dirty = true;
      }
    }
    if (dirty) {
      installmentRepository.saveAll(installments);
    }
  }

  // Atualiza valor total em um Projeto (poderia ser private -> está public para ser acessado em testConfig)
  public void updateProjectTotal(Long projectId) {
    BigDecimal total = installmentRepository
        .findByProjectId(projectId)
        .stream()
        .map(Installment::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

    project.setTotalValue(total);
    projectRepository.save(project);
  }

  // mapeamente entidade para DTO
  private InstallmentResponseDTO toDTO(Installment installment) {
    return new InstallmentResponseDTO(
        installment.getId(),
        installment.getEstimatedPaymentDate(),
        installment.getRealPaymentDate(),
        installment.getPaymentMethod(),
        installment.getPaymentStatus(),
        installment.getAmount(),
        installment.getDescription(),
        installment.getProject().getId());
  }
}
