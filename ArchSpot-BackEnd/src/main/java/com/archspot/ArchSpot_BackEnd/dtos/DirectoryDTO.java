package com.archspot.ArchSpot_BackEnd.dtos;

import com.archspot.ArchSpot_BackEnd.entities.Document;
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
  private List<Document> documents;
}
