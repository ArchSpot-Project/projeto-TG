package com.archspot.ArchSpot_BackEnd.templates.dtos;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectTemplateDTO {
  private Long id;
  private String name;
  private String description;
  private List<PhaseTemplateDTO> phases;
  private Long createdBy;
  private boolean isDefault;
}
