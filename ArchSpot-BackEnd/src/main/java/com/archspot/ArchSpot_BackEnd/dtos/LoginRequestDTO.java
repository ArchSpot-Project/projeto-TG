package com.archspot.ArchSpot_BackEnd.dtos;

public record LoginRequestDTO(
    String email,
    String password
) {}