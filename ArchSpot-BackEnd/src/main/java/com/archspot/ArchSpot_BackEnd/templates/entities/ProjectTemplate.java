package com.archspot.ArchSpot_BackEnd.templates.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

import com.archspot.ArchSpot_BackEnd.entities.User;

@Entity
@Table(name = "tb_project_template")
@Getter
@Setter
@NoArgsConstructor
public class ProjectTemplate {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  private String description;

  @ManyToOne
  @JoinColumn(name = "created_by_id")
  private User createdBy;

  private boolean isDefault = false;

  @ManyToMany
  @JoinTable(name = "project_template_phase_template", joinColumns = @JoinColumn(name = "project_template_id"), inverseJoinColumns = @JoinColumn(name = "phase_template_id"))
  private List<PhaseTemplate> phaseTemplates = new ArrayList<>();

  public ProjectTemplate(String name, String description, User createdBy) {
    this.name = name;
    this.description = description;
    this.createdBy = createdBy;
  }
}
