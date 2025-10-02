package com.archspot.ArchSpot_BackEnd.entities;

import java.time.LocalDate;

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
  private LocalDate realStartDate;
  private LocalDate realEndDate;

  private Integer duration;

  // referência simples para predecessora (para teste inicial)
  // TODO: futuramente, previousPhase poderá ser substituído ou complementado por PhaseDependency.
  @ManyToOne
  @JoinColumn(name = "previous_phase_id")
  @JsonIgnore
  private Phase previousPhase;

  // relacionamento com projeto
  @ManyToOne
  @JoinColumn(name = "project_id")
  @JsonIgnore
  private Project project;

  // construtores
  public Phase() {
  }

  public Phase(Long id, String name, String description, 
                      LocalDate estimatedStartDate, LocalDate estimatedEndDate, 
                      LocalDate realStartDate, LocalDate realEndDate,
                      Integer duration, Phase previousPhase, Project project) {
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
  }

}
