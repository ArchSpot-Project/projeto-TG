package com.archspot.ArchSpot_BackEnd.templates.repositories;

import com.archspot.ArchSpot_BackEnd.templates.entities.PhaseTemplate;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PhaseTemplateRepository extends JpaRepository<PhaseTemplate, Long> {
  List<PhaseTemplate> findByIsDefaultTrue();

  @Query("SELECT p FROM PhaseTemplate p WHERE p.createdBy.id = :userId")
  List<PhaseTemplate> findAllByUserId(@Param("userId") Long userId);
}
