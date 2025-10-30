package com.archspot.ArchSpot_BackEnd.dtos;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlbumDTO {
  private Long id;
  private String name;
  private String description;
  private LocalDateTime creationDate;
  private Long projectId;
  private List<PhotoDTO> photos;
}
