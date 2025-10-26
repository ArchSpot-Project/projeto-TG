package com.archspot.ArchSpot_BackEnd.repositories;

import com.archspot.ArchSpot_BackEnd.entities.Document;
import com.archspot.ArchSpot_BackEnd.entities.Directory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByDirectory(Directory directory);

    List<Document> findByDirectoryId(Long directoryId);

    List<Document> findByUploadedById(Long userId);
}
