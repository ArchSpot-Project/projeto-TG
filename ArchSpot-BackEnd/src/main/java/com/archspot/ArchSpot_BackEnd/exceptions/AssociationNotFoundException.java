package com.archspot.ArchSpot_BackEnd.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class AssociationNotFoundException extends RuntimeException {
    public AssociationNotFoundException(Long userId, Long projectId) {
        super("Association between user " + userId + " and project " + projectId + " not found.");
    }
}