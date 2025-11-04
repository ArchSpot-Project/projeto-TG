package com.archspot.ArchSpot_BackEnd.dtos.album;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

import com.archspot.ArchSpot_BackEnd.dtos.photo.PhotoDTO;

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
  private Long uploadedById;
  private List<PhotoDTO> photos;
}
