package com.archspot.ArchSpot_BackEnd.dtos.photo;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhotoUploadDTO {
  private String name; // opcional
  private Long uploadedById;
}
