package com.archspot.ArchSpot_BackEnd.reports.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.entities.Installment;
import com.archspot.ArchSpot_BackEnd.entities.Phase;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;
import com.archspot.ArchSpot_BackEnd.enums.ProjectStatus;
import com.archspot.ArchSpot_BackEnd.reports.dtos.FinancialGeneralRowDTO;
import com.archspot.ArchSpot_BackEnd.reports.dtos.FinancialProjectRowDTO;
import com.archspot.ArchSpot_BackEnd.reports.dtos.ReportFilterDTO;
import com.archspot.ArchSpot_BackEnd.reports.dtos.ReportResponseDTO;
import com.archspot.ArchSpot_BackEnd.reports.dtos.ScheduleGeneralRowDTO;
import com.archspot.ArchSpot_BackEnd.reports.dtos.ScheduleProjectRowDTO;
import com.archspot.ArchSpot_BackEnd.repositories.InstallmentRepository;
import com.archspot.ArchSpot_BackEnd.repositories.PhaseRepository;
import com.archspot.ArchSpot_BackEnd.repositories.UserProjectRepository;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;

@Service
public class ReportServiceImpl implements ReportService {

  @Autowired
  private UserProjectRepository userProjectRepository;

  @Autowired
  private PhaseRepository phaseRepository;

  @Autowired
  private InstallmentRepository installmentRepository;

  @Override
  public ReportResponseDTO<?> generateReport(ReportFilterDTO filters) {

    String type = filters.getReportType();

    return switch (type) {
      case "SCHEDULE_GENERAL" ->
        new ReportResponseDTO<>(type, generateScheduleGeneral(filters));

      case "SCHEDULE_PROJECT" ->
        new ReportResponseDTO<>(type, generateScheduleProject(filters));

      case "FINANCIAL_GENERAL" ->
        new ReportResponseDTO<>(type, generateFinancialGeneral(filters));

      case "FINANCIAL_PROJECT" ->
        new ReportResponseDTO<>(type, generateFinancialProject(filters));

      default -> throw new IllegalArgumentException("Tipo de relatório inválido");
    };
  }

  /*
   * MÉTODOS DE GERAÇÃO DOS 4 RELATÓRIOS
   */

  // CRONOGRAMA GERAL
  private List<ScheduleGeneralRowDTO> generateScheduleGeneral(ReportFilterDTO filters) {

    Long currentUserId = SecurityUtils.getCurrentUserId();

    // buscar projetos do user
    List<Project> projects = userProjectRepository.findProjectsByUserId(currentUserId).stream()
        .filter(p -> filterProjectByStatus(p, filters))
        .filter(p -> filterProjectByDate(p, filters))
        .toList();

    // filtro por role dentro do projeto (opcional)
    if (filters.getUserRole() != null) {
      projects = projects.stream()
          .filter(p -> userProjectRepository.existsByProjectIdAndUserIdAndRole(
              p.getId(), currentUserId, filters.getUserRole()))
          .toList();
    }

    if (projects.isEmpty())
      return List.of();

    List<Long> projectIds = projects.stream().map(Project::getId).toList();

    // phases para cálculo de % concluído
    var phases = phaseRepository.findByProjectIdIn(projectIds)
        .stream()
        .collect(Collectors.groupingBy(p -> p.getProject().getId()));

    // installments para cálculo de % pago
    var installments = installmentRepository.findByProjectIdIn(projectIds)
        .stream()
        .collect(Collectors.groupingBy(i -> i.getProject().getId()));

    return projects.stream()
        .map(p -> buildScheduleGeneralRow(
            p,
            phases.getOrDefault(p.getId(), List.of()),
            installments.getOrDefault(p.getId(), List.of())))
        .sorted(Comparator.comparing(ScheduleGeneralRowDTO::getProjectName))
        .toList();
  }

  // CRONOGRAMA POR PROJETO
  private List<ScheduleProjectRowDTO> generateScheduleProject(ReportFilterDTO filters) {
    if (filters.getProjectId() == null) {
      throw new IllegalArgumentException("É necessário informar projectId para este relatório.");
    }

    Long projectId = filters.getProjectId();

    // Garantir que o usuário pode acessar esse projeto
    Long currentUserId = SecurityUtils.getCurrentUserId();
    if (!userProjectRepository.existsByProjectIdAndUserId(projectId, currentUserId)) {
      throw new IllegalArgumentException("Você não tem permissão para visualizar este projeto.");
    }

    // Buscar fases
    var phases = phaseRepository.findByProjectIdOrderByEstimatedStartDateAsc(projectId);

    return phases.stream()
        .map(phase -> {

          ScheduleProjectRowDTO dto = new ScheduleProjectRowDTO();

          dto.setPhaseId(phase.getId());
          dto.setPhaseName(phase.getName());
          dto.setStatus(phase.getStatus().toString());

          // cálculo simplificado da % concluído
          dto.setPercentComplete(calculatePhaseProgress(phase));

          dto.setEstimatedStartDate(phase.getEstimatedStartDate());
          dto.setEstimatedEndDate(phase.getEstimatedEndDate());
          dto.setRealStartDate(
              phase.getRealStartDate() != null ? phase.getRealStartDate().toLocalDate() : null);
          dto.setRealEndDate(
              phase.getRealEndDate() != null ? phase.getRealEndDate().toLocalDate() : null);

          return dto;
        })
        .toList();
  }

  // FINANCEIRO GERAL
  private List<FinancialGeneralRowDTO> generateFinancialGeneral(ReportFilterDTO filters) {

    Long currentUserId = SecurityUtils.getCurrentUserId();

    // 1 — Buscar projetos e aplicar filtros básicos
    List<Project> projects = userProjectRepository.findProjectsByUserId(currentUserId).stream()
        .filter(p -> filterProjectByStatus(p, filters))
        .filter(p -> filterProjectByDate(p, filters))
        .toList();

    if (filters.getUserRole() != null) {
      projects = projects.stream()
          .filter(project -> userProjectRepository.existsByProjectIdAndUserIdAndRole(
              project.getId(), currentUserId, filters.getUserRole()))
          .toList();
    }

    // Se não houver projetos após filtros, retorno rápido
    if (projects.isEmpty())
      return List.of();

    // 2 — Buscar parcelas dos projetos filtrados
    List<Long> projectIds = projects.stream().map(Project::getId).toList();
    List<Installment> installments = installmentRepository.findByProjectIdIn(projectIds);

    // 3 — Filtro de parcelas (método de pagamento)
    installments = installments.stream()
        .filter(i -> filterInstallmentByPaymentMethod(i, filters))
        .toList();

    // 4 — Agrupar parcelas por projeto
    Map<Long, List<Installment>> grouped = installments.stream()
        .collect(Collectors.groupingBy(i -> i.getProject().getId()));

    // 5 — Mapear para DTO com cálculo de status e totais
    return projects.stream()
        .map(project -> buildFinancialGeneralRow(project, grouped.get(project.getId())))
        .sorted(Comparator.comparing(FinancialGeneralRowDTO::getProjectName))
        .toList();
  }

  // FINANCEIRO POR PROJETO
  private List<FinancialProjectRowDTO> generateFinancialProject(ReportFilterDTO filters) {

    if (filters.getProjectId() == null) {
      throw new IllegalArgumentException("É necessário informar um projectId para este relatório.");
    }

    Long projectId = filters.getProjectId();

    // Garantir que o usuário pode acessar esse projeto
    Long currentUserId = SecurityUtils.getCurrentUserId();
    if (!userProjectRepository.existsByProjectIdAndUserId(projectId, currentUserId)) {
      throw new IllegalArgumentException("Você não tem permissão para visualizar este projeto.");
    }

    // Buscamos as parcelas
    List<Installment> installments = installmentRepository.findAllByProjectIdOrderByEstimatedPaymentDateAsc(projectId);

    return installments.stream()
        .filter(i -> filterInstallmentByDate(i, filters))
        .filter(i -> filterInstallmentByPaymentMethod(i, filters))
        .map(i -> {
          FinancialProjectRowDTO dto = new FinancialProjectRowDTO();
          dto.setInstallmentId(i.getId());
          dto.setDescription(i.getDescription());
          dto.setValue(i.getAmount());
          dto.setPaymentMethod(i.getPaymentMethod().toString());

          dto.setEstimatedPaymentDate(i.getEstimatedPaymentDate());
          dto.setRealPaymentDate(i.getRealPaymentDate());

          // Status simples (não criamos enum por enquanto)
          dto.setStatus(i.getRealPaymentDate() != null ? "PAGO" : "PENDENTE");

          return dto;
        })
        .sorted(Comparator.comparing(FinancialProjectRowDTO::getEstimatedPaymentDate,
            Comparator.nullsLast(Comparator.naturalOrder())))
        .toList();
  }

  /*
   * MÉTODOS AUXILIARES
   */

  // calcular progresso do projeto
  private int computeProjectProgress(List<Phase> phases) {
    if (phases.isEmpty())
      return 0;

    int sum = phases.stream()
        .mapToInt(this::calculatePhaseProgress)
        .sum();

    return sum / phases.size(); // média simples
  }

  // calcular porcentagem paga do projeto
  private int computePercentPaid(List<Installment> installments) {
    if (installments.isEmpty())
      return 0;

    double total = installments.stream()
        .mapToDouble(i -> i.getAmount().doubleValue())
        .sum();

    double paid = installments.stream()
        .filter(i -> i.getPaymentStatus() == PaymentStatus.PAID)
        .mapToDouble(i -> i.getAmount().doubleValue())
        .sum();

    if (total == 0)
      return 0;

    return (int) Math.round((paid / total) * 100);
  }

  // consturção do DTO de Cronograma Geral
  private ScheduleGeneralRowDTO buildScheduleGeneralRow(
      Project project, List<Phase> phases, List<Installment> installments) {

    ScheduleGeneralRowDTO dto = new ScheduleGeneralRowDTO();

    dto.setProjectId(project.getId());
    dto.setProjectName(project.getName());

    // status igual ao ProjectStatus final já computado
    dto.setStatus(project.getStatus().name());

    // % concluído via phases
    dto.setPercentComplete(computeProjectProgress(phases));

    // % pago via installments
    dto.setPercentPaid(computePercentPaid(installments));

    // datas diretamente do Project (muito mais consistente!)
    dto.setEstimatedStartDate(project.getEstimatedStartDate());
    dto.setEstimatedEndDate(project.getEstimatedEndDate());
    dto.setRealStartDate(
        project.getRealStartDate() != null ? project.getRealStartDate().toLocalDate() : null);
    dto.setRealEndDate(
        project.getRealEndDate() != null ? project.getRealEndDate().toLocalDate() : null);

    return dto;
  }

  // calcular progresso da etapa
  private int calculatePhaseProgress(Phase phase) {
    // concluído
    if (phase.getRealEndDate() != null) {
      return 100;
    }

    // em andamento
    if (phase.getRealStartDate() != null) {
      return 50;
    }

    // não começou
    return 0;
  }

  // filtra projeto por status
  private boolean filterProjectByStatus(Project p, ReportFilterDTO filters) {
    if (filters.getProjectStatus() == null)
      return true;
    return p.getStatus().equals(filters.getProjectStatus());
  }

  // filtro por datas
  private boolean filterProjectByDate(Project p, ReportFilterDTO filters) {

    if (!filters.hasAnyDate())
      return true;

    LocalDate start = filters.getStartDate();
    LocalDate end = filters.getEndDate();

    // Prioridade: DATA REAL (realStart/realEnd) > ESTIMADA
    // (estimatedStart/estimatedEnd)
    LocalDate compareStart = p.getRealStartDate() != null ? p.getRealStartDate().toLocalDate()
        : p.getEstimatedStartDate();

    LocalDate compareEnd = p.getRealEndDate() != null ? p.getRealEndDate().toLocalDate() : p.getEstimatedEndDate();

    // Sem datas válidas para comparação: exclui o projeto
    if (compareStart == null && compareEnd == null)
      return false;

    // Se só tem início
    if (start != null && end == null) {
      return (compareEnd != null && !compareEnd.isBefore(start));
    }

    // Se só tem fim
    if (end != null && start == null) {
      return (compareStart != null && !compareStart.isAfter(end));
    }

    // Se tem os dois
    return (compareEnd != null && !compareEnd.isBefore(start)) &&
        (compareStart != null && !compareStart.isAfter(end));
  }

  // filtro por método de pagamento
  private boolean filterInstallmentByPaymentMethod(Installment i, ReportFilterDTO filters) {
    if (filters.getPaymentMethod() == null)
      return true;
    return i.getPaymentMethod() == filters.getPaymentMethod();
  }

  // caculo do status financeiro por projeto
  private String computeFinancialStatus(Project p, List<Installment> installments) {

    if (p.getStatus() == ProjectStatus.CANCELLED)
      return "CANCELADO";
    if (installments == null || installments.isEmpty())
      return "SEM_PARCELAS";

    long paid = installments.stream().filter(i -> i.getRealPaymentDate() != null).count();
    long pending = installments.stream().filter(i -> i.getRealPaymentDate() == null).count();
    long overdue = installments.stream().filter(i -> i.getPaymentStatus() == PaymentStatus.OVERDUE).count();
    long total = installments.size();

    // quitado
    if (paid == total)
      return "QUITADO";

    // planejado
    if (p.getStatus() == ProjectStatus.PLANNED) {
      return paid == 0 ? "EM_PLANEJAMENTO" : "EM_ABERTO";
    }

    // em andamento
    if (p.getStatus() == ProjectStatus.IN_PROGRESS) {
      if (pending > 0)
        return "EM_ABERTO";
    }

    // concluído mas com pendências
    if (p.getStatus() == ProjectStatus.COMPLETED) {
      if (pending > 0 || overdue > 0)
        return "PENDENTE";
    }

    return "EM_ABERTO";
  }

  // construção do DTO de Financeiro Geral
  private FinancialGeneralRowDTO buildFinancialGeneralRow(
      Project project, List<Installment> installments) {
    if (installments == null)
      installments = List.of();

    BigDecimal totalValue = installments.stream()
        .map(Installment::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal totalPaid = installments.stream()
        .filter(i -> i.getRealPaymentDate() != null)
        .map(Installment::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    FinancialGeneralRowDTO dto = new FinancialGeneralRowDTO();
    dto.setProjectId(project.getId());
    dto.setProjectName(project.getName());
    dto.setStatus(computeFinancialStatus(project, installments));
    dto.setTotalValue(totalValue);
    dto.setTotalPaid(totalPaid);
    dto.setTotalRemaining(totalValue.subtract(totalPaid));

    return dto;
  }

  // filtra parcela por data
  private boolean filterInstallmentByDate(Installment i, ReportFilterDTO filters) {
    if (!filters.hasAnyDate())
      return true;

    LocalDate start = filters.getStartDate();
    LocalDate end = filters.getEndDate();

    LocalDate due = i.getEstimatedPaymentDate();
    LocalDate paid = i.getRealPaymentDate();

    // Caso só início
    if (start != null && end == null) {
      return (due != null && !due.isBefore(start))
          || (paid != null && !paid.isBefore(start));
    }

    // Caso só fim
    if (end != null && start == null) {
      return (due != null && !due.isAfter(end))
          || (paid != null && !paid.isAfter(end));
    }

    // Caso início + fim
    return ((due != null && !due.isBefore(start) && !due.isAfter(end)) ||
        (paid != null && !paid.isBefore(start) && !paid.isAfter(end)));
  }

}
