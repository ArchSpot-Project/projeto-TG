package com.archspot.ArchSpot_BackEnd.templates.repositories;

import com.archspot.ArchSpot_BackEnd.templates.entities.PhaseTemplate;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PhaseTemplateRepository extends JpaRepository<PhaseTemplate, Long> {
  List<PhaseTemplate> findByIsDefaultTrue();
}
