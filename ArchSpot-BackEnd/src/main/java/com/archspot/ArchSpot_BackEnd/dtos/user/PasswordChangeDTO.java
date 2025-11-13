package com.archspot.ArchSpot_BackEnd.dtos.user;

import jakarta.validation.constraints.NotBlank;

public record PasswordChangeDTO(
    @NotBlank String currentPassword,
    @NotBlank String newPassword
) {}
