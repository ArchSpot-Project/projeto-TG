package com.archspot.ArchSpot_BackEnd.controllers;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.archspot.ArchSpot_BackEnd.dtos.LoginRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserUpdateDTO;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService service;

    // Para consultar todos os usuarios
    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        List<User> list = service.findAll();
        return ResponseEntity.ok().body(list);
    }

    // Para consultar usuario pelo id
    @GetMapping(value = "/{id}")
    public ResponseEntity<User> find(@PathVariable Long id) {
        User obj = service.findById(id);
        return ResponseEntity.ok().body(obj);
    }

    // Para criar novo usuario 
    @PostMapping(value = "/create")
    public ResponseEntity<User> create(@Valid @RequestBody UserCreateDTO dto) {
        User obj = new User();
        obj = service.create(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(obj.getId()).toUri();
        return ResponseEntity.created(uri).body(obj);
    }

    // Para deletar usuario
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Para atualizar um usuario
    @PutMapping(value = "/{id}")
    public ResponseEntity<User> update(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO dto) {
        User user = service.update(id, dto);
        return ResponseEntity.ok().body(user);
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody LoginRequestDTO creds) {
        Optional<UserDTO> user = service.authenticate(creds);
        return user
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
