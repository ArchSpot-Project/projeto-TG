package com.archspot.ArchSpot_BackEnd.dtos.comment;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {

  private Long id;
  private String text;
  private LocalDateTime timestamp;
  private Long documentId;
  private Long userId;
}
