package com.archspot.ArchSpot_BackEnd.activities.dtos;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

import com.archspot.ArchSpot_BackEnd.activities.enums.ActivityType;

@Data
public class ActivityResponseDTO {

    private Long id;
    private LocalDateTime timestamp;
    private ActivityType type;
    private String userName;
    private String userRole;
    private String userAvatarUrl;
    private Map<String, Object> metadata;
}
