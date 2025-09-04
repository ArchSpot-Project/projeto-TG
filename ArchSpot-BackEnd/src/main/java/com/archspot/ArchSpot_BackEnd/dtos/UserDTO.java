package com.archspot.ArchSpot_BackEnd.dtos;

import com.archspot.ArchSpot_BackEnd.enums.UserRole;

public record UserDTO(
    Long id,
    String name,
    String email,
    UserRole role
) {}
