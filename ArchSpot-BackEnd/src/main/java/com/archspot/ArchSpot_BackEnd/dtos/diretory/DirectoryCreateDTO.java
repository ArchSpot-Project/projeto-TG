package com.archspot.ArchSpot_BackEnd.dtos.diretory;

import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DirectoryCreateDTO {
  private String name;
  private DirectoryType type;
  private Long projectId;
  private Long parentDirectoryId; // opcional, caso tenha diretório pai
}
