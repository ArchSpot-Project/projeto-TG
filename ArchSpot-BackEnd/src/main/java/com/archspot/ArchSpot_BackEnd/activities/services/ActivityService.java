package com.archspot.ArchSpot_BackEnd.activities.services;

import com.archspot.ArchSpot_BackEnd.activities.entities.Activity;
import com.archspot.ArchSpot_BackEnd.activities.enums.ActivityType;
import com.archspot.ArchSpot_BackEnd.activities.repositories.ActivityRepository;
import com.archspot.ArchSpot_BackEnd.entities.*;
import com.archspot.ArchSpot_BackEnd.enums.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ActivityService {

  @Autowired
  private ActivityRepository repo;

  @Autowired
  private ObjectMapper mapper;

  public Activity log(
      ActivityType type,
      User user,
      Project project,
      Map<String, Object> metadata) {
    try {
      Activity a = new Activity();
      a.setTimestamp(LocalDateTime.now());
      a.setType(type);
      a.setUser(user);
      a.setProject(project);
      a.setMetadata(mapper.writeValueAsString(metadata));

      return repo.save(a);

    } catch (Exception e) {
      throw new RuntimeException("Erro ao registrar atividade", e);
    }
  }

  public List<Activity> getActivitiesByProject(Long projectId) {
    Project p = new Project();
    p.setId(projectId);
    return repo.findByProjectOrderByTimestampDesc(p);
  }

  // métodos de gravação para cada tipo de atividade

  public void logPhaseStarted(User actor, Project project, String phaseName) {
    UserRole role = project.getUserRole(actor);
    String actorRole = role != null ? role.name() : "UNKNOWN";
    Map<String, Object> meta = Map.of(
        "phaseName", phaseName,
        "actorRole", actorRole);
    log(ActivityType.PHASE_STARTED, actor, project, meta);
  }

  public void logPhaseFinished(User actor, Project project, String phaseName) {
    UserRole role = project.getUserRole(actor);
    String actorRole = role != null ? role.name() : "UNKNOWN";
    Map<String, Object> meta = Map.of(
        "phaseName", phaseName,
        "actorRole", actorRole);
    log(ActivityType.PHASE_FINISHED, actor, project, meta);
  }

  public void logInstallmentPaid(User actor, Project project, int number, Double value) {
    UserRole role = project.getUserRole(actor);
    String actorRole = role != null ? role.name() : "UNKNOWN";
    Map<String, Object> meta = Map.of(
        "installmentNumber", number,
        "value", value,
        "actorRole", actorRole);
    log(ActivityType.INSTALLMENT_PAID, actor, project, meta);
  }

}
