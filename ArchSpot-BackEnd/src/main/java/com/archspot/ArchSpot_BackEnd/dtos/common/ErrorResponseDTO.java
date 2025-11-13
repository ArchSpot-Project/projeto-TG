package com.archspot.ArchSpot_BackEnd.dtos.common;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponseDTO {
  private int status;
  private String error;
  private String message;
  private String path;
  private LocalDateTime timestamp;
}
