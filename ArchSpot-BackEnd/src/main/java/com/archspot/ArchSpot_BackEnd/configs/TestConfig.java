package com.archspot.ArchSpot_BackEnd.configs;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;

@Configuration
@Profile("test")
public class TestConfig implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {

        User user1 = new User(null, "520.834.160-31", "Ana", "9999-9999", "Avenida General Carneiro, 1560", "Arquiteta", "ana@email.com", UserRole.ADMIN, "123");
        User user2 = new User(null, "268.647.710-59", "Fernando", "9888-9999", "Rua da Penha, 56", "Arquiteto", "fernando@email.com", UserRole.MEMBER, "456");
        User user3 = new User(null, "572.761.830-41", "Beatriz", "9777-9999", "Avenida Barão de Tatuí, 104", "Designer Gráfica", "beatriz@email.com", UserRole.CUSTOMER, "789");

        userRepository.saveAll(Arrays.asList(user1, user2, user3));
    }

}   
