package com.archspot.ArchSpot_BackEnd.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.archspot.ArchSpot_BackEnd.entities.Directory;

import java.util.List;

public interface DirectoryRepository extends JpaRepository<Directory, Long> {
    List<Directory> findByProjectId(Long projectId);
}