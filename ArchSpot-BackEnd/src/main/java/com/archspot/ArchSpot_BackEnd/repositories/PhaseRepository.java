package com.archspot.ArchSpot_BackEnd.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.archspot.ArchSpot_BackEnd.entities.Phase;

public interface PhaseRepository extends JpaRepository<Phase, Long> {

  List<Phase> findByProjectId(Long projectId);
  Optional<Phase> findFirstByProjectIdOrderByIdDesc(Long projectId);
  List<Phase> findByProjectIdOrderByEstimatedStartDateAsc(Long projectId);
}
