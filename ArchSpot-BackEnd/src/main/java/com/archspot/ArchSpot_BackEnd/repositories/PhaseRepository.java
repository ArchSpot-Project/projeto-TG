package com.archspot.ArchSpot_BackEnd.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.archspot.ArchSpot_BackEnd.entities.Phase;

public interface PhaseRepository extends JpaRepository<Phase, Long> {

  List<Phase> findByProjectId(Long projectId);
}
