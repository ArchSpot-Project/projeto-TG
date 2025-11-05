package com.archspot.ArchSpot_BackEnd.security;

import com.archspot.ArchSpot_BackEnd.entities.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

/**
 * Classe utilitata para recuperar User autenticado.
 * Centraliza a lógica e evita acesso ao SecurityContextHolder e casting.
 */
public final class SecurityUtils {

  private SecurityUtils() {
    // Impede instanciação
  }

  public static User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || auth.getPrincipal() == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated user found");
    }

    Object principal = auth.getPrincipal();

    if (principal instanceof AuthUser authUser) {
      return authUser.getUser();
    }
    
    if (principal instanceof User user) {
      return user;
    }

    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user in context");
  }

  /**
   * Verifica se o usuário está autenticado
   */
  public static boolean isAuthenticated() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    return auth != null &&
        auth.isAuthenticated() &&
        !(auth.getPrincipal() instanceof String); // evita "anonymousUser"
  }

  /**
   * Retorna o Id de um usuário autenticado.
   */
  public static Long getCurrentUserId() {
    return getCurrentUser().getId();
  }
}
