package com.archspot.ArchSpot_BackEnd.templates.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhaseTemplateDTO {
  private Long id;
  private String name;
  private String description;
  private Integer defaultDurationDays;
}
