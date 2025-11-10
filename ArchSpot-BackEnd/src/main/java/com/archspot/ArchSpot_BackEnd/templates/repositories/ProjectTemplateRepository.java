package com.archspot.ArchSpot_BackEnd.templates.repositories;

import com.archspot.ArchSpot_BackEnd.templates.entities.ProjectTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectTemplateRepository extends JpaRepository<ProjectTemplate, Long> {
}
