package com.archspot.ArchSpot_BackEnd.activities.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.archspot.ArchSpot_BackEnd.activities.enums.ActivityType;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_activity")
@Getter
@Setter
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private ActivityType type;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // quem gerou a atividade

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "project_id")
    private Project project; // a qual projeto pertence

    @Column(columnDefinition = "TEXT")
    private String metadata; // JSON genérico para detalhes específicos

    public Activity() {}

    // getters e setters
}
