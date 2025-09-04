package com.archspot.ArchSpot_BackEnd.dtos;

import com.archspot.ArchSpot_BackEnd.enums.UserRole;

public record UserCreateDTO(
  String cpf,
  String name,
  String phone,
  String address,
  String profession,
  String email,
  UserRole userRole,
  String password
) {}
