package com.archspot.ArchSpot_BackEnd.dtos;

import java.time.LocalDateTime;

import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;

import lombok.Data;

@Data
public class DirectoryDTO {
  private Long id;
  private String name;
  private DirectoryType type;
  private LocalDateTime creationDate;
  private Long projectId;
}
