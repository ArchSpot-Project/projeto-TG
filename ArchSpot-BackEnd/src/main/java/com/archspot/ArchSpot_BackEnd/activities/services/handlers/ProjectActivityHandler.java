package com.archspot.ArchSpot_BackEnd.activities.services.handlers;

import com.archspot.ArchSpot_BackEnd.activities.enums.ActivityType;
import com.archspot.ArchSpot_BackEnd.activities.services.ActivityService;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ProjectActivityHandler {

  @Autowired
  private ActivityService activityService;

  private String getActorRole(Project project, User actor) {
    UserRole role = project.getUserRole(actor);
    return role != null ? role.name() : "UNKNOWN";
  }

  public void updated(User actor, Project project, String name, String description) {
    activityService.log(
        ActivityType.PROJECT_UPDATED,
        actor,
        project,
        Map.of(
            "projectName", name,
            "projectDescription", description,
            "actorRole", getActorRole(project, actor)));
  }

  public void finalized(User actor, Project project) {
    activityService.log(
        ActivityType.PROJECT_FINALIZED,
        actor,
        project,
        Map.of(
            "actorRole", getActorRole(project, actor)));
  }

  public void cancelled(User actor, Project project) {
    activityService.log(
        ActivityType.PROJECT_CANCELLED,
        actor,
        project,
        Map.of(
            "actorRole", getActorRole(project, actor)));
  }
}
