package com.archspot.ArchSpot_BackEnd.dtos.user;

public record UserCreateDTO(
  String cpf,
  String name,
  String phone,
  String address,
  String profession,
  String email,
  String password
) {}
