package com.archspot.ArchSpot_BackEnd.activities.repositories;

import com.archspot.ArchSpot_BackEnd.activities.entities.Activity;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByProjectOrderByTimestampDesc(Project project);
}
