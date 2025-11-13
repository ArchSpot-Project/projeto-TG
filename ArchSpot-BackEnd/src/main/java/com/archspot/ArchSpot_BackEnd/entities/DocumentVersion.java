package com.archspot.ArchSpot_BackEnd.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_document_version")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private Integer versionNumber;
  private String fileUrl;
  private Long size;
  private LocalDateTime uploadedAt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "document_id", nullable = false)
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Document document;
}
