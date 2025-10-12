package com.archspot.ArchSpot_BackEnd.dtos;

import com.archspot.ArchSpot_BackEnd.enums.UserRole;

public record UserProjectRequestDTO(
        Long userId,
        Long projectId,
        UserRole role
) {}
