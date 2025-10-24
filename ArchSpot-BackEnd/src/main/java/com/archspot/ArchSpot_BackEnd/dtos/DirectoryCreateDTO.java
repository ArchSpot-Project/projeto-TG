package com.archspot.ArchSpot_BackEnd.dtos;

import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;

import lombok.Data;

@Data
public class DirectoryCreateDTO {
  private String name;
  private DirectoryType type;
  private Long projectId;
}
