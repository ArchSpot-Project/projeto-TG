package com.archspot.ArchSpot_BackEnd.templates.repositories;

import com.archspot.ArchSpot_BackEnd.templates.entities.ProjectTemplate;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectTemplateRepository extends JpaRepository<ProjectTemplate, Long> {
  List<ProjectTemplate> findByIsDefaultTrue();

  @Query("SELECT p FROM ProjectTemplate p WHERE p.createdBy.id = :userId")
  List<ProjectTemplate> findAllByUserId(@Param("userId") Long userId);
}
