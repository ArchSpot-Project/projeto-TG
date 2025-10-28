package com.archspot.ArchSpot_BackEnd.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.archspot.ArchSpot_BackEnd.entities.Directory;
import com.archspot.ArchSpot_BackEnd.enums.DirectoryType;

import java.util.List;

public interface DirectoryRepository extends JpaRepository<Directory, Long> {
    List<Directory> findByProjectId(Long projectId);

    List<Directory> findByProjectIdAndType(Long projectId, DirectoryType type);

    List<Directory> findByParentDirectoryId(Long parentId);
}