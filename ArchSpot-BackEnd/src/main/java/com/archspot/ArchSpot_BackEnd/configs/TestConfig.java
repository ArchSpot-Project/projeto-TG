package com.archspot.ArchSpot_BackEnd.configs;

import java.time.LocalDate;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.Phase;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.entities.UserProject;
import com.archspot.ArchSpot_BackEnd.enums.Status;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.repositories.PhaseRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import com.archspot.ArchSpot_BackEnd.repositories.UserProjectRepository;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;

@Configuration
@Profile("test")
public class TestConfig implements CommandLineRunner {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ProjectRepository projectRepository;

        @Autowired
        private PhaseRepository phaseRepository;

        @Autowired
        private UserProjectRepository userProjectRepository;

        @Override
        public void run(String... args) throws Exception {

                // ==== USERS ====
                User user1 = new User(null, "520.834.160-31", "Ana", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta",
                                "ana@email.com", "123");
                User user2 = new User(null, "268.647.710-59", "Fernando", "9888-9999", "Rua da Penha, 56", "Arquiteto",
                                "fernando@email.com", "456");
                User user3 = new User(null, "572.761.830-41", "Beatriz", "9777-9999", "Avenida Barão de Tatuí, 104",
                                "Designer Gráfica", "beatriz@email.com", "789");

                userRepository.saveAll(Arrays.asList(user1, user2, user3));

                // ==== PROJECTS ====
                Project project1 = new Project();
                project1.setName("Residência Beatriz");
                project1.setEstimatedStartDate(LocalDate.of(2025, 2, 3));
                project1.setEstimatedEndDate(LocalDate.of(2025, 6, 2));
                project1.setDescription("Projeto residencial unifamiliar para Beatriz");
                project1.setStatus(Status.IN_PROGRESS);

                Project project2 = new Project();
                project2.setName("Loja Fernando Sports");
                project2.setEstimatedStartDate(LocalDate.of(2025, 3, 1));
                project2.setEstimatedEndDate(LocalDate.of(2025, 5, 15));
                project2.setDescription("Projeto comercial de loja esportiva");
                project2.setStatus(Status.PLANNED);

                projectRepository.saveAll(Arrays.asList(project1, project2));

                // ==== PROJECT PHASES ====
                Phase phase1 = new Phase(null, "Estudo Preliminar", "Plantas e volumetria",
                                LocalDate.of(2025, 1, 15), LocalDate.of(2025, 2, 3),
                                null, null, 15, null, project1);

                Phase phase2 = new Phase(null, "Anteprojeto", "Aprovação da cliente",
                                LocalDate.of(2025, 2, 4), LocalDate.of(2025, 4, 14),
                                null, null, 40, phase1, project1);

                Phase phase3 = new Phase(null, "Projeto Executivo", "Detalhamento técnico",
                                LocalDate.of(2025, 4, 15), LocalDate.of(2025, 6, 2),
                                null, null, 45, phase2, project1);

                Phase phase4 = new Phase(null, "Estudo de Layout", "Definição espacial inicial",
                                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 3, 15),
                                null, null, 15, null, project2);

                phaseRepository.saveAll(Arrays.asList(phase1, phase2, phase3, phase4));

                // ==== USER-PROJECT ASSOCIATIONS ====
                UserProject up1 = new UserProject(user1, project1, UserRole.ADMIN);
                UserProject up2 = new UserProject(user2, project1, UserRole.STAFF);
                UserProject up3 = new UserProject(user3, project1, UserRole.CUSTOMER);
                UserProject up4 = new UserProject(user1, project2, UserRole.ADMIN);
                UserProject up5 = new UserProject(user2, project2, UserRole.STAFF);

                userProjectRepository.saveAll(Arrays.asList(up1, up2, up3, up4, up5));
        }

}
