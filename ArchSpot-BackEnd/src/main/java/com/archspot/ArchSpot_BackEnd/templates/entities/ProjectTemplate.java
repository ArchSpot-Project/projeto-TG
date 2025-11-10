package com.archspot.ArchSpot_BackEnd.templates.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

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

  @ManyToMany
  @JoinTable(name = "project_template_phase_template", joinColumns = @JoinColumn(name = "project_template_id"), inverseJoinColumns = @JoinColumn(name = "phase_template_id"))
  @OrderBy("sortOrder ASC")
  private List<PhaseTemplate> phaseTemplates = new ArrayList<>();

  public ProjectTemplate(String name, String description) {
    this.name = name;
    this.description = description;
  }
}
