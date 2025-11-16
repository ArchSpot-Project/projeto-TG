package com.archspot.ArchSpot_BackEnd.exceptions;

import com.archspot.ArchSpot_BackEnd.dtos.common.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private ResponseEntity<ErrorResponseDTO> buildErrorResponse(
      Exception ex, HttpStatus status, HttpServletRequest request) {

    ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
        .status(status.value())
        .error(status.getReasonPhrase())
        .message(ex.getMessage())
        .path(request.getRequestURI())
        .timestamp(LocalDateTime.now())
        .build();

    return ResponseEntity.status(status).body(errorResponse);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponseDTO> handleResourceNotFound(ResourceNotFoundException ex,
      HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
  }

  @ExceptionHandler(DatabaseException.class)
  public ResponseEntity<ErrorResponseDTO> handleDatabaseException(DatabaseException ex, HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
  }

  @ExceptionHandler(BusinessRuleException.class)
  public ResponseEntity<String> handleBusinessException(BusinessRuleException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
  }

  @ExceptionHandler(AssociationNotFoundException.class)
  public ResponseEntity<ErrorResponseDTO> handleAssociationNotFound(AssociationNotFoundException ex,
      HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
  }

  @ExceptionHandler(UnauthorizedException.class)
  public ResponseEntity<ErrorResponseDTO> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
  }

  @ExceptionHandler(ForbiddenOperationException.class)
  public ResponseEntity<ErrorResponseDTO> handleForbidden(ForbiddenOperationException ex, HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<ErrorResponseDTO> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponseDTO> handleGenericException(Exception ex, HttpServletRequest request) {
    return buildErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
  }
}
