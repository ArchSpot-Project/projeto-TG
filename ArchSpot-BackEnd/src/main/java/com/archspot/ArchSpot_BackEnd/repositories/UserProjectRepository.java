package com.archspot.ArchSpot_BackEnd.repositories;

import com.archspot.ArchSpot_BackEnd.entities.UserProject;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
