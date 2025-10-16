package com.archspot.ArchSpot_BackEnd.entities;

import com.archspot.ArchSpot_BackEnd.enums.Status;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private LocalDate realStartDate;
    private LocalDate realEndDate;

    private String Description;
    private Status status;

    // valor total do projeto (será calculado a partir das parcelas)
    private BigDecimal totalValue;

    // associação com fases
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Phase> phases = new ArrayList<>();

    // associação com users
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // evita loop no JSON; exposição via DTOs
    private List<UserProject> userProjects = new ArrayList<>();

    // Métodos de negócio
    public void finalizeProject() {
        this.realEndDate = LocalDate.now();
        this.status = Status.COMPLETED;
    }

    public void cancelProject() {
        this.realEndDate = LocalDate.now();
        this.status = Status.CANCELLED;
    }

    // Método para recalcular datas
    public void updateEstimatedDates() {
        if (phases == null || phases.isEmpty()) {
            this.estimatedStartDate = null;
            this.estimatedEndDate = null;
            return;
        }

        // Menor data de início estimada entre as fases
        this.estimatedStartDate = phases.stream()
                .map(Phase::getEstimatedStartDate)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElse(null);

        // Maior data de fim estimada entre as fases
        this.estimatedEndDate = phases.stream()
                .map(Phase::getEstimatedEndDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElse(null);
    }
}
