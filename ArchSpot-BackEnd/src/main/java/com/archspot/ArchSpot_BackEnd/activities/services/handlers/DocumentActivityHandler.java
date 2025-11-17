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
public class DocumentActivityHandler {

  @Autowired
  private ActivityService activityService;

  private String getActorRole(Project project, User actor) {
    UserRole role = project.getUserRole(actor);
    return role != null ? role.name() : "UNKNOWN";
  }

  public void uploaded(User actor, Project project, String name, String description, String url, String dirName) {
    activityService.log(
        ActivityType.DOCUMENT_UPLOADED,
        actor,
        project,
        Map.of(
            "fileName", name,
            "fileDescription", description,
            "fileUrl", url,
            "directoryName", dirName,
            "actorRole", getActorRole(project, actor)));
  }

  public void infoUpdated(User actor, Project project, String newName, String oldName,
      String newDescription, String oldDescription, String url, String dirName) {
    activityService.log(
        ActivityType.DOCUMENT_INFO_UPDATED,
        actor,
        project,
        Map.of(
            "fileNewName", newName,
            "fileOldName", oldName,
            "fileNewDescription", newDescription,
            "fileOldDescription", oldDescription,
            "fileUrl", url,
            "directoryName", dirName,
            "actorRole", getActorRole(project, actor)));
  }

  public void versioned(User actor, Project project, String name, int version, String url, String dirName) {
    activityService.log(
        ActivityType.DOCUMENT_VERSIONED,
        actor,
        project,
        Map.of(
            "fileName", name,
            "documentVersion", version,
            "fileUrl", url,
            "directoryName", dirName,
            "actorRole", getActorRole(project, actor)));
  }

  public void deleted(User actor, Project project, String name, String dirName) {
    activityService.log(
        ActivityType.DOCUMENT_DELETED,
        actor,
        project,
        Map.of(
            "fileName", name,
            "directoryName", dirName,
            "actorRole", getActorRole(project, actor)));
  }
}
