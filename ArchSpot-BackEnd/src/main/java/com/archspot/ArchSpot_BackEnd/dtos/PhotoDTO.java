package com.archspot.ArchSpot_BackEnd.dtos;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoDTO {
  private Long id;
  private String name;
  private LocalDateTime uploadDate;
  private String fileUrl;
  private Long size;
  private Long albumId;
  private Long uploadedById;
}
