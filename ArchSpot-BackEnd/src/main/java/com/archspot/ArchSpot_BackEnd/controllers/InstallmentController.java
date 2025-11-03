package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.installment.InstallmentRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.installment.InstallmentResponseDTO;
import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;
import com.archspot.ArchSpot_BackEnd.services.InstallmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

@RestController
@RequestMapping("/installments")
public class InstallmentController {

  /*
   * Esse controller é responsável pelo CRUD básico das parcelas
   * assim como o método de pagamento de uma parcela.
   * Os demais endpoints de agregação de resultados ficam com ProjectController
   */

  @Autowired
  private InstallmentService installmentService;

  // Criar nova parcela
  @PostMapping
  public ResponseEntity<InstallmentResponseDTO> create(@RequestBody InstallmentRequestDTO dto) {
    InstallmentResponseDTO created = installmentService.create(dto);
    return ResponseEntity.status(CREATED).body(created);
  }

  // Atualizar parcela existente
  @PutMapping("/{id}")
  public ResponseEntity<InstallmentResponseDTO> update(@PathVariable Long id, @RequestBody InstallmentRequestDTO dto) {
    InstallmentResponseDTO updated = installmentService.update(id, dto);
    return ResponseEntity.ok(updated);
  }

  // Deletar parcela
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    installmentService.delete(id);
    return ResponseEntity.status(NO_CONTENT).build();
  }

  // Buscar parcela por ID
  @GetMapping("/{id}")
  public ResponseEntity<InstallmentResponseDTO> findById(@PathVariable Long id) {
    return ResponseEntity.ok(installmentService.findById(id));
  }

  // Buscar todas as parcelas
  @GetMapping
  public ResponseEntity<List<InstallmentResponseDTO>> findAll() {
    return ResponseEntity.ok(installmentService.findAll());
  }

  // Pagar uma parcela (p. ex.: endpoint + ?method=PIX)
  @PatchMapping("/{id}/pay")
  public ResponseEntity<InstallmentResponseDTO> payInstallment(
      @PathVariable Long id,
      @RequestParam PaymentMethod method) {
    return ResponseEntity.ok(installmentService.payInstallment(id, method));
  }

  //cancelar uma parcela
  @PatchMapping("/{id}/cancel")
  public ResponseEntity<InstallmentResponseDTO> cancelInstallment(@PathVariable Long id) {
    InstallmentResponseDTO canceled = installmentService.cancelInstallment(id);
    return ResponseEntity.ok(canceled);
  }

  // retorna lista de enums de status de pagamento
  @GetMapping("/payment-status")
  public ResponseEntity<List<String>> getPaymentStatuses() {
    List<String> statuses = Arrays.stream(PaymentStatus.values())
        .map(Enum::name)
        .toList();
    return ResponseEntity.ok(statuses);
  }

  // retorna lista de enums de métodos de pagamento
  @GetMapping("/payment-methods")
  public ResponseEntity<List<String>> getPaymentMethods() {
    List<String> methods = Arrays.stream(PaymentMethod.values())
        .map(Enum::name)
        .toList();
    return ResponseEntity.ok(methods);
  }
}
