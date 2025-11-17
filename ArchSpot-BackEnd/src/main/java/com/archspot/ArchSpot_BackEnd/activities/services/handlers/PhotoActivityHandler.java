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
public class PhotoActivityHandler {

  @Autowired
  private ActivityService activityService;

  private String getActorRole(Project project, User actor) {
    UserRole role = project.getUserRole(actor);
    return role != null ? role.name() : "UNKNOWN";
  }

  public void uploaded(
      User actor,
      Project project,
      String photoName,
      String albumName,
      String fileUrl) {

    activityService.log(
        ActivityType.PHOTO_UPLOADED,
        actor,
        project,
        Map.of(
            "photoName", photoName,
            "albumName", albumName,
            "fileUrl", fileUrl,
            "actorRole", getActorRole(project, actor)));
  }

  public void updated(
      User actor,
      Project project,
      String oldPhotoName,
      String newPhotoName,
      String albumName,
      String fileUrl) {

    activityService.log(
        ActivityType.PHOTO_UPDATED,
        actor,
        project,
        Map.of(
            "photoOldName", oldPhotoName,
            "photoNewName", newPhotoName,
            "albumName", albumName,
            "fileUrl", fileUrl,
            "actorRole", getActorRole(project, actor)));
  }

  public void deleted(
      User actor,
      Project project,
      String photoName,
      String albumName) {

    activityService.log(
        ActivityType.PHOTO_DELETED,
        actor,
        project,
        Map.of(
            "photoName", photoName,
            "albumName", albumName,
            "actorRole", getActorRole(project, actor)));
  }
}
