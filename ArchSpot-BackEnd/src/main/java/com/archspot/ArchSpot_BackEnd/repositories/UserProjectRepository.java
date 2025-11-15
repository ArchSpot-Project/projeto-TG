package com.archspot.ArchSpot_BackEnd.repositories;

import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.UserProject;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserProjectRepository extends JpaRepository<UserProject, Long> {

    // buscar por project id
    List<UserProject> findByProjectId(Long projectId);

    // buscar por user id
    List<UserProject> findByUserId(Long userId);

    // buscar associação específica
    Optional<UserProject> findByUserIdAndProjectId(Long userId, Long projectId);

    // deletar por user+project
    void deleteByUserIdAndProjectId(Long userId, Long projectId);

    @Query("SELECT up.project FROM UserProject up WHERE up.user.id = :userId")
    List<Project> findProjectsByUserId(Long userId);

    boolean existsByProjectIdAndUserIdAndRole(Long projectId, Long userId, UserRole role);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
}
