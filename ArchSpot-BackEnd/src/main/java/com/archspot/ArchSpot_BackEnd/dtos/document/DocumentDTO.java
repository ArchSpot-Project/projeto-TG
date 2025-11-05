package com.archspot.ArchSpot_BackEnd.dtos.document;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {
  private Long id;
  private String name;
  private LocalDateTime uploadDate;
  private LocalDateTime modificationDate;
  private Long size;
  private Integer version;
  private String description;
  private String fileUrl;
  private Long directoryId;
  private Long uploadedById;
}
