package com.archspot.ArchSpot_BackEnd.exceptions;

public class AssociationNotFoundException extends RuntimeException {
    public AssociationNotFoundException(Long userId, Long projectId) {
        super("Association between user " + userId + " and project " + projectId + " not found.");
    }
}