package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.photo.PhotoDTO;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.services.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/photos")
public class PhotoController {

  @Autowired
  private PhotoService photoService;

  // listar por álbum e upload de foto para álbum aninhados em AlbumController

  // atualizar nome da foto
  @PatchMapping("/{id}")
  public ResponseEntity<PhotoDTO> updateName(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
    String newName = body.get("name");
    return ResponseEntity.ok(photoService.updateMetadata(id, newName));
  }

  // deletar foto
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    photoService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // download
  @GetMapping("/{id}/download")
  public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
    Path filePath = photoService.getFilePath(id);
    if (!Files.exists(filePath))
      throw new ResourceNotFoundException("File not found");

    Resource resource = new UrlResource(filePath.toUri());
    String contentType = Files.probeContentType(filePath);
    if (contentType == null)
      contentType = "application/octet-stream";

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName() + "\"")
        .body(resource);
  }

  // visualização inline (diretamente no navegador)
  @GetMapping("/{id}/view")
  public ResponseEntity<Resource> view(@PathVariable Long id) throws IOException {
    Path filePath = photoService.getFilePath(id);
    if (!Files.exists(filePath))
      throw new ResourceNotFoundException("File not found");

    Resource resource = new UrlResource(filePath.toUri());
    String contentType = Files.probeContentType(filePath);
    if (contentType == null)
      contentType = "application/octet-stream";

    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType(contentType))
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filePath.getFileName() + "\"")
        .body(resource);
  }

}
