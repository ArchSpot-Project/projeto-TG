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
public class CommentActivityHandler {

  @Autowired
  private ActivityService activityService;

  private String getActorRole(Project project, User actor) {
    UserRole role = project.getUserRole(actor);
    return role != null ? role.name() : "UNKNOWN";
  }

  public void added(User actor, Project project, String text) {
    activityService.log(
        ActivityType.COMMENT_ADDED,
        actor,
        project,
        Map.of(
            "commentText", text,
            "actorRole", getActorRole(project, actor)));
  }

  public void deleted(User actor, Project project) {
    activityService.log(
        ActivityType.COMMENT_DELETED,
        actor,
        project,
        Map.of(
            "actorRole", getActorRole(project, actor)));
  }
}
