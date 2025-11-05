package com.archspot.ArchSpot_BackEnd.dtos.diretory;

import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentDTO;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DirectoryDTO {
  private Long id;
  private String name;
  private LocalDateTime creationDate;
  private DirectoryType type;
  private Long projectId;
  private Long parentDirectoryId;
  private List<DirectoryDTO> subdirectories;
  private List<DocumentDTO> documents;
}
