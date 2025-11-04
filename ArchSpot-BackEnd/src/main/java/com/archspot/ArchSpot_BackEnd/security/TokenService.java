package com.archspot.ArchSpot_BackEnd.security;

import com.archspot.ArchSpot_BackEnd.entities.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class TokenService {

  @Value("${api.security.token.secret}")
  private String secret;

  // Expiração do token (ex: 24h)
  private final long expiration = 1000 * 60 * 60 * 24;

  private Algorithm getAlgorithm() {
    return Algorithm.HMAC256(secret);
  }

  public String generateToken(User user) {
    try {
      return JWT.create()
          .withIssuer("ArchSpot API")
          .withSubject(user.getId().toString())
          .withIssuedAt(new Date())
          .withExpiresAt(new Date(System.currentTimeMillis() + expiration))
          .sign(getAlgorithm());
    } catch (JWTCreationException e) {
      throw new RuntimeException("error while genereting token", e);
    }

  }

  public boolean isTokenValid(String token) {
    try {
      JWTVerifier verifier = JWT.require(getAlgorithm()).withIssuer("ArchSpot API").build();
      verifier.verify(token);
      return true;
    } catch (JWTVerificationException e) {
      return false;
    }
  }

  public Long getUserId(String token) {
    JWTVerifier verifier = JWT.require(getAlgorithm()).withIssuer("ArchSpot API").build();
    DecodedJWT decodedJWT = verifier.verify(token);
    return Long.parseLong(decodedJWT.getSubject());
  }
}
