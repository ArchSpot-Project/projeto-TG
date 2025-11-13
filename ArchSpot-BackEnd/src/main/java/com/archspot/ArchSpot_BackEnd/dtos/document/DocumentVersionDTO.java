package com.archspot.ArchSpot_BackEnd.dtos.document;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentVersionDTO {
    private Long id;
    private Integer versionNumber;
    private String fileUrl;
    private Long size;
    private LocalDateTime uploadedAt;
}
