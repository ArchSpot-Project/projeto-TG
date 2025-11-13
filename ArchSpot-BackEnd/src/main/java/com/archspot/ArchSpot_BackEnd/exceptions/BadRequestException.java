package com.archspot.ArchSpot_BackEnd.exceptions;

public class BadRequestException extends RuntimeException {
  public BadRequestException(String message) {
    super(message);
  }
}
