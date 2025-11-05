package com.archspot.ArchSpot_BackEnd.dtos.userproject;

import com.archspot.ArchSpot_BackEnd.enums.UserRole;

public record UserProjectResponseDTO(
        Long id,
        Long userId,
        String userName,
        Long projectId,
        String projectName,
        UserRole role
) {}
