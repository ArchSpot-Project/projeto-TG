package com.archspot.ArchSpot_BackEnd.activities.services.handlers;

import com.archspot.ArchSpot_BackEnd.activities.enums.ActivityType;
import com.archspot.ArchSpot_BackEnd.activities.services.ActivityService;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class InstallmentActivityHandler {

  @Autowired
  private ActivityService activityService;

  private String getActorRole(Project project, User actor) {
    UserRole role = project.getUserRole(actor);
    return role != null ? role.name() : "UNKNOWN";
  }

  public void created(User actor, Project project, String description, BigDecimal value) {
    activityService.log(
        ActivityType.INSTALLMENT_CREATED,
        actor,
        project,
        Map.of(
            "installmentDescription", description,
            "value", value,
            "actorRole", getActorRole(project, actor)));
  }

  public void updated(User actor, Project project, String description, BigDecimal value) {
    activityService.log(
        ActivityType.INSTALLMENT_UPDATED,
        actor,
        project,
        Map.of(
            "installmentDescription", description,
            "value", value,
            "actorRole", getActorRole(project, actor)));
  }

    public void deleted(User actor, Project project, String description, BigDecimal value) {
    activityService.log(
        ActivityType.INSTALLMENT_UPDATED,
        actor,
        project,
        Map.of(
            "installmentDescription", description,
            "value", value,
            "actorRole", getActorRole(project, actor)));
  }

  public void paid(User actor, Project project, String description, BigDecimal value) {
    activityService.log(
        ActivityType.INSTALLMENT_PAID,
        actor,
        project,
        Map.of(
            "installmentDescription", description,
            "value", value,
            "actorRole", getActorRole(project, actor)));
  }
}
