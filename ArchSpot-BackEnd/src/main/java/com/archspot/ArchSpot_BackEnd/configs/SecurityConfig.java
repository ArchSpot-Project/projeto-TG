package com.archspot.ArchSpot_BackEnd.configs;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.archspot.ArchSpot_BackEnd.security.AuthUserDetailsService;
import com.archspot.ArchSpot_BackEnd.security.SecurityFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final SecurityFilter securityFilter; // será criado na Etapa 2

  private final AuthUserDetailsService authUserDetailsService;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // libera login e registro
            .requestMatchers("/auth/login", "/auth/register").permitAll()
            // qualquer outra rota exige token
            .anyRequest().authenticated())
        // garante que nosso filtro JWT roda ANTES do filtro padrão de login
        .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  // @Bean
  // public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
  //   AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);

  //   authBuilder.userDetailsService(authUserDetailsService)
  //       .passwordEncoder(passwordEncoder());

  //   return authBuilder.build(); // sem usar .and()
  // }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
