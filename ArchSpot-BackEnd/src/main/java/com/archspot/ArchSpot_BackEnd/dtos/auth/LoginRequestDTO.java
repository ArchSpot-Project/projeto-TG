package com.archspot.ArchSpot_BackEnd.dtos.auth;

public record LoginRequestDTO(
    String email,
    String password
) {}