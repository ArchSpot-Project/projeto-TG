package com.archspot.ArchSpot_BackEnd.entities;

import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_directory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Directory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private LocalDateTime creationDate; // preenchido com LocalDateTime.now() no service

    @Enumerated(EnumType.STRING)
    private DirectoryType type; // DRAWINGS ou DOCUMENTS

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // Auto-relacionamento para subdiretórios
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Directory parentDirectory;

    @Builder.Default
    @OneToMany(mappedBy = "parentDirectory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Directory> subdirectories = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "directory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();

    public void addDocument(Document document) {
        documents.add(document);
        document.setDirectory(this);
    }
}
