package com.archspot.ArchSpot_BackEnd.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.archspot.ArchSpot_BackEnd.entities.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

}
