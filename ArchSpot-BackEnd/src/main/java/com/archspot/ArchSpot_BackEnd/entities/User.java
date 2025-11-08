package com.archspot.ArchSpot_BackEnd.entities;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.validator.constraints.br.CPF;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "tb_user")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CPF(message = "O CPF deve ser valido")
    @NotBlank(message = "CPF nao pode ser vazio")
    private String cpf;

    @NotBlank(message = "Nome nao pode ser vazio")
    private String name;

    private String phone;
    private String address;
    private String profession;

    @Email(message = "O e-mail deve ser valido")
    @NotBlank(message = "E-mail nao pode ser vazio")
    private String email;

    // private UserRole userRole; -> ficou como uma classe de associacao
    /*
     * avaliar no futuro se cabe um enum de acesso geral à plataforma
     * (p. ex.: standard, premium, corporate, admin do sistema, etc...)
     */

    @NotBlank(message = "Senha nao pode ser vazia")
    @ToString.Exclude
    private String password;

    @Column(name = "profile_image")
    private String fileUrl;

    // Método para encriptar a senha automaticamente de toda instância que for
    // persistida ou atualziada
    @PrePersist
    @PreUpdate
    private void encryptPassword() {
        if (this.password != null && !this.password.startsWith("$2a")) { // evita rehash se já estiver encriptada
            this.password = new BCryptPasswordEncoder().encode(this.password);
        }
    }

    // associacão com projeto
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // evita loop JSON; troque conforme sua estratégia de DTOs
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<UserProject> userProjects = new ArrayList<>();

    // 🔹 Associação com Comment (sem cascade)
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Comment> comments = new ArrayList<>();

    // construtores
    public User() {
    }

    public User(Long id, String cpf, String name, String phone, String address, String profession, String email,
            String password) {
        this.id = id;
        this.cpf = cpf;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.profession = profession;
        this.email = email;
        this.password = password;
    }
}
