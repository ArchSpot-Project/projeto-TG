package com.archspot.ArchSpot_BackEnd.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;

@Entity
@Table(name = "tb_directories")
@Data
public class Directory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private LocalDateTime creationDate;

    @Enumerated(EnumType.STRING)
    private DirectoryType type; // DRAWINGS ou DOCUMENTS

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @OneToMany(mappedBy = "directory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents;
}
