package com.archspot.ArchSpot_BackEnd.entities;

import com.archspot.ArchSpot_BackEnd.enums.ProjectStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "tb_project")
@Data
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome nao pode ser vazio")
    private String name;

    private LocalDate estimatedStartDate;
    private LocalDate estimatedEndDate;
    private LocalDateTime realStartDate;
    private LocalDateTime realEndDate;

    private String description;
    private ProjectStatus status;

    // valor total do projeto (será calculado a partir das parcelas)
    private BigDecimal totalValue;

    // associação com fases
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Phase> phases = new ArrayList<>();

    // associação com users
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // evita loop no JSON; exposição via DTOs
    private List<UserProject> userProjects = new ArrayList<>();

    // associação com parcelas
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Installment> installments = new ArrayList<>();

    // associação com diretórios
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Directory> directories = new ArrayList<>();

    // Métodos de negócio
    public void startProject() {
        this.realStartDate = LocalDateTime.now();
        this.status = ProjectStatus.IN_PROGRESS;
    }

    public void finalizeProject() {
        this.realEndDate = LocalDateTime.now();
        this.status = ProjectStatus.COMPLETED;
    }

    public void cancelProject() {
        this.realEndDate = LocalDateTime.now();
        this.status = ProjectStatus.CANCELLED;
    }

    // Método para recalcular datas e status
    public void updateDatesAndStatus() {
        if (phases == null || phases.isEmpty()) {
            this.estimatedStartDate = null;
            this.estimatedEndDate = null;
            this.realStartDate = null;
            this.realEndDate = null;
            this.status = ProjectStatus.PLANNED;
            return;
        }

        // Menor data estimada de início entre as fases
        this.estimatedStartDate = phases.stream()
                .map(Phase::getEstimatedStartDate)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElse(null);

        // Maior data estimada de fim entre as fases
        this.estimatedEndDate = phases.stream()
                .map(Phase::getEstimatedEndDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElse(null);

        // Menor data real de início entre as fases
        this.realStartDate = phases.stream()
                .map(Phase::getRealStartDate)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(null);

        // Determinando status
        boolean allPlanned = phases.stream().allMatch(p -> p.getRealStartDate() == null);
        boolean anyInProgress = phases.stream()
                .anyMatch(p -> p.getRealStartDate() != null && p.getRealEndDate() == null);
        boolean allCompleted = phases.stream().allMatch(p -> p.getRealEndDate() != null);

        if (allPlanned) {
            this.status = ProjectStatus.PLANNED; // Nenhuma fase começou
        } else if (anyInProgress) {
            this.status = ProjectStatus.IN_PROGRESS; // Pelo menos uma fase em andamento
        } else if (allCompleted) {
            this.status = ProjectStatus.COMPLETED; // Todas as fases concluídas

            // Maior data real de fim entre as fases
            this.realEndDate = phases.stream()
                    .map(Phase::getRealEndDate)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);

        } else {
            this.status = ProjectStatus.IN_PROGRESS; // fallback
            this.realEndDate = null;
        }
    }
}
