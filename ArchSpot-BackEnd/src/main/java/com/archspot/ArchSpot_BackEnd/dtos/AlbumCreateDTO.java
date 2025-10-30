package com.archspot.ArchSpot_BackEnd.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlbumCreateDTO {
  private String name;
  private String description;
  private Long projectId;
}
