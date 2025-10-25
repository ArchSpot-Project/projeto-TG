package com.archspot.ArchSpot_BackEnd.configs;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.Installment;
import com.archspot.ArchSpot_BackEnd.entities.Phase;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.entities.UserProject;
import com.archspot.ArchSpot_BackEnd.enums.PaymentMethod;
import com.archspot.ArchSpot_BackEnd.enums.PaymentStatus;
import com.archspot.ArchSpot_BackEnd.enums.Status;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.archspot.ArchSpot_BackEnd.repositories.InstallmentRepository;
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

        @Autowired
        private InstallmentRepository installmentRepository;

        @Override
        public void run(String... args) throws Exception {

                // ==== USERS ====
                User user1 = new User(null, "439.779.870-20", "Ana", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta",
                                "ana@email.com", "123");
                User user2 = new User(null, "847.381.614-58", "Fernando", "9888-9999", "Rua da Penha, 56", "Arquiteto",
                                "fernando@email.com", "456");
                User user3 = new User(null, "887.832.723-99", "Beatriz", "9777-9999", "Avenida Barão de Tatuí, 104",
                                "Designer Gráfica", "beatriz@email.com", "789");
                User user4 = new User(null, "397.983.748-35", "Hélio", "9666-8888", "Rua das Palmeiras, 220",
                                "Engenheiro Civil", "helio@email.com", "101112");
                User user5 = new User(null, "439.779.870-20", "Diego", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "diego@email.com", "123");
                User user6 = new User(null, "439.779.870-20", "Elisa", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "elisa@email.com", "123");
                User user7 = new User(null, "439.779.870-20", "Felipe", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "felipe@email.com", "123");
                User user8 = new User(null, "439.779.870-20", "Gabriela", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "gabriela@email.com", "123");
                User user9 = new User(null, "439.779.870-20", "Henrique", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "henrique@email.com", "123");
                User user10 = new User(null, "439.779.870-20", "Isabela", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "isabela@email.com", "123");
                User user11 = new User(null, "439.779.870-20", "João", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "joao@email.com", "123");
                User user12 = new User(null, "439.779.870-20", "Larissa", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "larissa@email.com", "123");
                User user13 = new User(null, "439.779.870-20", "Marcos", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "marcos@email.com", "123");
                User user14 = new User(null, "439.779.870-20", "Natália", "9999-9999", "Avenida General Carneiro, 1560",
                                "Arquiteta", "natalia@email.com", "123");

                userRepository.saveAll(Arrays.asList(user1, user2, user3, user4, user5, user6, user7, user8, user9,
                                user10, user11, user12, user13, user14));

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

                Project project3 = new Project();
                project3.setName("Dimas Assistência Técnica");
                project3.setEstimatedStartDate(LocalDate.of(2025, 5, 2));
                project3.setEstimatedEndDate(LocalDate.of(2025, 6, 19));
                project3.setDescription("Projeto de loja de assistência técnica");
                project3.setStatus(Status.COMPLETED);

                Project project4 = new Project();
                project4.setName("Munari Coworking");
                project4.setEstimatedStartDate(LocalDate.of(2025, 1, 2));
                project4.setEstimatedEndDate(LocalDate.of(2025, 3, 2));
                project4.setDescription("Projeto de escritório compartilhado");
                project4.setStatus(Status.CANCELLED);

                projectRepository.saveAll(Arrays.asList(project1, project2, project3, project4));

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

                Phase phase5 = new Phase(null, "Fase 5", "Definição fase 5",
                                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 5, 15),
                                null, null, 15, null, project3);

                phaseRepository.saveAll(Arrays.asList(phase1, phase2, phase3, phase4, phase5));

                // ==== USER-PROJECT ASSOCIATIONS ====
                UserProject up1 = new UserProject(user1, project1, UserRole.ADMIN);
                UserProject up2 = new UserProject(user2, project1, UserRole.STAFF);
                UserProject up3 = new UserProject(user3, project1, UserRole.CUSTOMER);
                UserProject up4 = new UserProject(user1, project2, UserRole.ADMIN);
                UserProject up5 = new UserProject(user2, project2, UserRole.STAFF);
                UserProject up6 = new UserProject(user1, project3, UserRole.ADMIN);
                UserProject up7 = new UserProject(user2, project4, UserRole.ADMIN);
                UserProject up8 = new UserProject(user4, project3, UserRole.ADMIN);
                UserProject up9 = new UserProject(user4, project4, UserRole.STAFF);
                UserProject up10 = new UserProject(user1, project4, UserRole.ADMIN);

                userProjectRepository.saveAll(Arrays.asList(up1, up2, up3, up4, up5, up6, up7, up8, up9, up10));

                // ==== INSTALLMENTS ====
                Installment ins1 = new Installment();
                ins1.setProject(project1);
                ins1.setEstimatedPaymentDate(LocalDate.of(2025, 2, 15));
                ins1.setAmount(BigDecimal.valueOf(5000));
                ins1.setPaymentStatus(PaymentStatus.PENDING);
                ins1.setPaymentMethod(PaymentMethod.CREDIT_CARD);
                ins1.setDescription("Parcela inicial");

                Installment ins2 = new Installment();
                ins2.setProject(project1);
                ins2.setEstimatedPaymentDate(LocalDate.of(2025, 3, 15));
                ins2.setAmount(BigDecimal.valueOf(7000));
                ins2.setPaymentStatus(PaymentStatus.PENDING);
                ins2.setPaymentMethod(PaymentMethod.BOLETO);
                ins2.setDescription("Segunda parcela");

                Installment ins3 = new Installment();
                ins3.setProject(project2);
                ins3.setEstimatedPaymentDate(LocalDate.of(2025, 12, 10));
                ins3.setAmount(BigDecimal.valueOf(8000));
                ins3.setPaymentStatus(PaymentStatus.PENDING);
                ins3.setPaymentMethod(PaymentMethod.DEBIT_CARD);
                ins3.setDescription("Parcela única");

                installmentRepository.saveAll(Arrays.asList(ins1, ins2, ins3));

                // Associa as parcelas aos projetos (para garantir bidirecionalidade)
                project1.getInstallments().addAll(Arrays.asList(ins1, ins2));
                project2.getInstallments().add(ins3);
                projectRepository.saveAll(Arrays.asList(project1, project2));
        }

}