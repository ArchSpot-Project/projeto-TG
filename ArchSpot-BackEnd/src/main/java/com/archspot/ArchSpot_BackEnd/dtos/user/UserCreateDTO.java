package com.archspot.ArchSpot_BackEnd.dtos.user;

import org.springframework.web.multipart.MultipartFile;

public record UserCreateDTO(
  String cpf,
  String name,
  String phone,
  String address,
  String profession,
  String email,
  String password,
  MultipartFile profileImage
) {}
