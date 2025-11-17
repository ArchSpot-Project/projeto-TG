package com.archspot.ArchSpot_BackEnd.activities.services.utils;

import com.archspot.ArchSpot_BackEnd.activities.dtos.ActivityResponseDTO;
import com.archspot.ArchSpot_BackEnd.activities.entities.Activity;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class ActivityMapper {

  private final ObjectMapper mapper = new ObjectMapper();

  public ActivityResponseDTO toDTO(Activity a) {

    ActivityResponseDTO dto = new ActivityResponseDTO();
    dto.setId(a.getId());
    dto.setTimestamp(a.getTimestamp());
    dto.setType(a.getType());

    dto.setUserName(a.getUser().getName());
    dto.setUserAvatarUrl(a.getUser().getFileUrl()); // se existir

    // Lê metadata primeiro
    Map<String, Object> metadataMap = null;
    try {
      metadataMap = mapper.readValue(a.getMetadata(), Map.class);
    } catch (Exception e) {
      metadataMap = null;
    }
    dto.setMetadata(metadataMap);

    // userRole vem do metadata, não de User
    if (metadataMap != null && metadataMap.containsKey("actorRole")) {
      dto.setUserRole(metadataMap.get("actorRole").toString());
    } else {
      dto.setUserRole(null);
    }

    return dto;
  }
}
