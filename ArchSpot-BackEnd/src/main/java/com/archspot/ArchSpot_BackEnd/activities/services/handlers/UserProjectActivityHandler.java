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
public class UserProjectActivityHandler {

  @Autowired
  private ActivityService activityService;

  private String getActorRole(Project project, User actor) {
    UserRole role = project.getUserRole(actor);
    return role != null ? role.name() : "UNKNOWN";
  }

  public void assigned(User actor, Project project, User userAssigned, UserRole role) {
    activityService.log(
        ActivityType.USER_ASSIGNED_TO_PROJECT,
        actor,
        project,
        Map.of(
            "userAssignedName", userAssigned.getName(),
            "fileUrl", safe(userAssigned.getFileUrl()),
            "assignedRole", role.name(),
            "actorRole", getActorRole(project, actor)));
  }

  // public void removed(User actor, Project project, User userRemoved) {
  //   activityService.log(
  //       ActivityType.USER_REMOVED_FROM_PROJECT,
  //       actor,
  //       project,
  //       Map.of(
  //           "userRemovedName", userRemoved.getName(),
  //           "fileUrl", safe(userRemoved. ()),
  //           "actorRole", getActorRole(project, actor)));
  // }

  public void roleUpdated(User actor,
      Project project,
      User userAssigned,
      UserRole oldRole,
      UserRole newRole) {

    activityService.log(
        ActivityType.USER_ROLE_UPDATED,
        actor,
        project,
        Map.of(
            "userAssignedName", userAssigned.getName(),
            "fileUrl", safe(userAssigned.getFileUrl()),
            "oldRole", safe(oldRole != null ? oldRole.name() : "NONE"),
            "newRole", newRole.name(),
            "actorRole", getActorRole(project, actor)));
  }

  private String safe(Object value) {
    return value != null ? value.toString() : "";
  }
}
