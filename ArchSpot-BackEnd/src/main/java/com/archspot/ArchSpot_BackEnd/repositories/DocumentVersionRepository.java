package com.archspot.ArchSpot_BackEnd.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.archspot.ArchSpot_BackEnd.entities.Document;
import com.archspot.ArchSpot_BackEnd.entities.DocumentVersion;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {
    List<DocumentVersion> findByDocumentOrderByVersionNumberDesc(Document document);

    void deleteAllByDocumentId(Long documentId);

    List<DocumentVersion> findByDocumentId(Long documentId);
}