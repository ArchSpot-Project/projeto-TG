package com.archspot.ArchSpot_BackEnd.exceptions;

public class ForbiddenOperationException extends RuntimeException {
  public ForbiddenOperationException(String message) {
    super(message);
  }
}
