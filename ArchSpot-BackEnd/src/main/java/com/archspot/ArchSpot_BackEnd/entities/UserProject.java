package com.archspot.ArchSpot_BackEnd.entities;

import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_user_project")
@Data
@NoArgsConstructor
public class UserProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associação com User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Associação com Project
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Papel do usuário neste projeto
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // Data de vínculo
    @Column(name = "assigned_at")
    private java.time.LocalDateTime assignedAt = java.time.LocalDateTime.now();

    public UserProject(User user, Project project, UserRole role) {
        this.user = user;
        this.project = project;
        this.role = role;
    }
}
