package com.archspot.ArchSpot_BackEnd.entities;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.archspot.ArchSpot_BackEnd.enums.PhaseStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "tb_phase")
@Data
public class Phase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message = "Nome nao pode ser vazio")
  private String name;

  private String description;

  @NotNull(message = "Data estimada de início não pode ser nula")
  private LocalDate estimatedStartDate;
  private LocalDate estimatedEndDate;
  private LocalDateTime realStartDate;
  private LocalDateTime realEndDate;

  private Integer duration;

  // referência simples para predecessora (para teste inicial)
  // Futuramente, previousPhase poderá ser substituído ou complementado por
  // PhaseDependency (classe de associção).
  @ManyToOne
  @JoinColumn(name = "previous_phase_id")
  @JsonIgnore
  private Phase previousPhase;

  // relacionamento com projeto
  @ManyToOne
  @JoinColumn(name = "project_id")
  @JsonIgnore
  private Project project;

  // status da etapa
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PhaseStatus status = PhaseStatus.NOT_STARTED;

  // construtores
  public Phase() {
  }

  public Phase(Long id, String name, String description,
      LocalDate estimatedStartDate, LocalDate estimatedEndDate,
      LocalDateTime realStartDate, LocalDateTime realEndDate,
      int duration, Phase previousPhase, Project project) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.estimatedStartDate = estimatedStartDate;
    this.estimatedEndDate = estimatedEndDate;
    this.realStartDate = realStartDate;
    this.realEndDate = realEndDate;
    this.duration = duration;
    this.previousPhase = previousPhase;
    this.project = project;
    this.status = PhaseStatus.NOT_STARTED;
  }

}
