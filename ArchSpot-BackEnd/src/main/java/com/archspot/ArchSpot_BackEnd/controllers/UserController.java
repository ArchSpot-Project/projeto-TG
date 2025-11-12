package com.archspot.ArchSpot_BackEnd.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.archspot.ArchSpot_BackEnd.dtos.user.UserUpdateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.userproject.UserProjectResponseDTO;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.services.UserProjectService;
import com.archspot.ArchSpot_BackEnd.services.UserService;

@RestController
@RequestMapping(value = "/users")
public class UserController {

    @Autowired
    private UserService service;

    @Autowired
    private UserProjectService userProjectService;

    /*
     * Rotas de /create (register) e /login são competencias de AuthController
     */

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

    // retorna as roles disponíveis
    @GetMapping("/roles")
    public ResponseEntity<UserRole[]> getAllRoles() {
        return ResponseEntity.ok(UserRole.values());
    }

    // endpoint para recuperar projetos de um usuário
    @GetMapping("/{userId}/projects")
    public ResponseEntity<List<UserProjectResponseDTO>> getProjectsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userProjectService.getByUser(userId));
    }

    // Para deletar usuario
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Para atualizar um usuario
    // @PutMapping(value = "/{id}")
    // public ResponseEntity<User> update(@PathVariable Long id, @Valid @RequestBody
    // UserUpdateDTO dto) {
    // User user = service.update(id, dto);
    // return ResponseEntity.ok().body(user);
    // }
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<User> update(
            @PathVariable Long id,
            @RequestPart("user") UserUpdateDTO dto,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {

        User user = service.update(id, dto, profileImage);
        return ResponseEntity.ok().body(user);
    }
}
