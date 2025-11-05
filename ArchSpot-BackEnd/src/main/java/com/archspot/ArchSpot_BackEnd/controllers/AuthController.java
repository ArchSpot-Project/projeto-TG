package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.auth.LoginRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.user.UserCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.user.UserDTO;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.security.AuthUser;
import com.archspot.ArchSpot_BackEnd.security.TokenService;
import com.archspot.ArchSpot_BackEnd.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final TokenService tokenService;
  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequestDTO creds) {
    try {
      var authToken = new UsernamePasswordAuthenticationToken(creds.email(), creds.password());
      var auth = authenticationManager.authenticate(authToken);

      AuthUser authUser = (AuthUser) auth.getPrincipal();
      User user = authUser.getUser();

      String token = tokenService.generateToken(user);

      return ResponseEntity.ok(new LoginResponse(token, new UserDTO(user.getId(), user.getName(), user.getEmail())));
    } catch (Exception e) {
      return ResponseEntity.status(401).build();
    }
  }

  @PostMapping("/register")
  public ResponseEntity<UserDTO> register(@RequestBody UserCreateDTO dto) {

    // criptografa a senha no service
    User user = userService.create(dto);

    return ResponseEntity.ok(new UserDTO(user.getId(), user.getName(), user.getEmail()));
  }

  // DTO interno para retorno de login
  private record LoginResponse(String token, UserDTO user) {
  }
}
