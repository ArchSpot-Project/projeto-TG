package com.archspot.ArchSpot_BackEnd.templates.entities;

import com.archspot.ArchSpot_BackEnd.entities.User;

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

  @ManyToOne
  @JoinColumn(name = "created_by_id")
  private User createdBy;

  private boolean isDefault = false;

  public PhaseTemplate(String name, Integer defaultDurationDays, User createdBy) {
    this.name = name;
    this.defaultDurationDays = defaultDurationDays;
    this.createdBy = createdBy;
  }
}
