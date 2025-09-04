package com.archspot.ArchSpot_BackEnd.entities;

import org.hibernate.validator.constraints.br.CPF;

import com.archspot.ArchSpot_BackEnd.enums.UserRole;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

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

    private UserRole userRole; // verificar se é melhor criar uma classe de associacao

    @NotBlank(message = "Senha nao pode ser vazia")
    private String password;

    // associacoes

    // construtores
    public User() {}

    public User(Long id, String cpf, String name, String phone, String address, String profession, String email,
            UserRole userRole, String password) {
        this.id = id;
        this.cpf = cpf;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.profession = profession;
        this.email = email;
        this.userRole = userRole;
        this.password = password;
    }
}
