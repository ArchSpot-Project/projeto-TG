package com.archspot.ArchSpot_BackEnd.templates.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tb_phase_template")
@Getter
@Setter
@NoArgsConstructor
public class PhaseTemplate {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  private Integer defaultDurationDays;

  private Integer sortOrder;

  public PhaseTemplate(String name, Integer defaultDurationDays, Integer sortOrder) {
    this.name = name;
    this.defaultDurationDays = defaultDurationDays;
    this.sortOrder = sortOrder;
  }
}
