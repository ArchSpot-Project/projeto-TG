package com.archspot.ArchSpot_BackEnd.utils;

import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;

public class ProjectPermissionUtils {

  /*
   * Verifica se o usuário é ADMIN do projeto.
   */
  public static boolean isAdmin(Project project, User user) {
    return project.getUserProjects().stream()
        .anyMatch(up -> up.getUser().getId().equals(user.getId())
            && up.getRole().name().equalsIgnoreCase("ADMIN"));
  }

  /*
   * Verifica se o usuário é STAFF do projeto.
   */
  public static boolean isStaff(Project project, User user) {
    return project.getUserProjects().stream()
        .anyMatch(up -> up.getUser().getId().equals(user.getId())
            && up.getRole().name().equalsIgnoreCase("STAFF"));
  }

  /*
   * Verifica se o usuário é ADMIN ou STAFF do projeto.
   */
  public static boolean isAdminOrStaff(Project project, User user) {
    return project.getUserProjects().stream()
        .anyMatch(up -> up.getUser().getId().equals(user.getId())
            && (up.getRole().name().equalsIgnoreCase("ADMIN")
                || up.getRole().name().equalsIgnoreCase("STAFF")));
  }

  /*
   * Verifica se o usuário é CUSTOMER do projeto.
   */
  public static boolean isCustomer(Project project, User user) {
    return project.getUserProjects().stream()
        .anyMatch(up -> up.getUser().getId().equals(user.getId())
            && up.getRole().name().equalsIgnoreCase("CUSTOMER"));
  }

  /*
   * Verifica se o usuário é EXTERNAL_COLLABORATOR do projeto.
   */
  public static boolean isExternalCollaborator(Project project, User user) {
    return project.getUserProjects().stream()
        .anyMatch(up -> up.getUser().getId().equals(user.getId())
            && up.getRole().name().equalsIgnoreCase("EXTERNAL_COLLABORATOR"));
  }

}
