package com.archspot.ArchSpot_BackEnd.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCreateDTO {

  private String text;
  private Long documentId;
  private Long userId;
}
