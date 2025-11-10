package com.archspot.ArchSpot_BackEnd.templates.dtos;

import java.util.List;

public class ProjectTemplateDTO {
  private Long id;
  private String name;
  private String description;
  private List<PhaseTemplateDTO> phases;

  // getters/setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<PhaseTemplateDTO> getPhases() {
    return phases;
  }

  public void setPhases(List<PhaseTemplateDTO> phases) {
    this.phases = phases;
  }
}
