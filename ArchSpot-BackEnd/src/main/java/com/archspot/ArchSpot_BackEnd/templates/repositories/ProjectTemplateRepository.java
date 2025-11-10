package com.archspot.ArchSpot_BackEnd.templates.repositories;

import com.archspot.ArchSpot_BackEnd.templates.entities.ProjectTemplate;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectTemplateRepository extends JpaRepository<ProjectTemplate, Long> {
  List<ProjectTemplate> findByIsDefaultTrue();
}
