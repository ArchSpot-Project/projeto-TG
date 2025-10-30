package com.archspot.ArchSpot_BackEnd.repositories;

import com.archspot.ArchSpot_BackEnd.entities.Album;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlbumRepository extends JpaRepository<Album, Long> {
  List<Album> findByProjectId(Long projectId);

  // opcional (retirar se não usar)
  List<Album> findByProject(Project project);
}