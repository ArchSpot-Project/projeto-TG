package com.archspot.ArchSpot_BackEnd.controllers;

import com.archspot.ArchSpot_BackEnd.dtos.AlbumCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.AlbumDTO;
import com.archspot.ArchSpot_BackEnd.dtos.PhotoDTO;
import com.archspot.ArchSpot_BackEnd.services.AlbumService;
import com.archspot.ArchSpot_BackEnd.services.PhotoService;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/albums")
@CrossOrigin(origins = "http://localhost:4200")
public class AlbumController {

  @Autowired
  private AlbumService albumService;

  @Autowired
  private PhotoService photoService;

  // criar álbum e listar por projeto aninhados em ProjecController

  // buscar por id
  @GetMapping("/{id}")
  public ResponseEntity<AlbumDTO> getById(@PathVariable Long id) {
    return ResponseEntity.ok(albumService.findById(id));
  }

  // atualizar (name/description)
  @PutMapping("/{id}")
  public ResponseEntity<AlbumDTO> update(@PathVariable Long id, @RequestBody AlbumCreateDTO dto) {
    return ResponseEntity.ok(albumService.update(id, dto));
  }

  // deletar
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    albumService.delete(id);
    return ResponseEntity.noContent().build();
  }

  /*
   * ENDPOINTS DE FOTOS
   */

  // listar fotos por álbum
  @GetMapping("/{albumId}/photos")
  public ResponseEntity<List<PhotoDTO>> listPhotosByAlbum(@PathVariable Long albumId) {
    return ResponseEntity.ok(photoService.findByAlbum(albumId));
  }

  // upload de foto para álbum (form-data)
  @PostMapping("/{albumId}/photos")
  public ResponseEntity<PhotoDTO> uploadPhoto(
      @PathVariable Long albumId,
      @RequestParam("file") MultipartFile file,
      @RequestParam("uploadedById") Long uploadedById,
      @RequestParam(value = "name", required = false) String name) throws IOException {
    PhotoDTO saved = photoService.uploadPhoto(albumId, uploadedById, file, name);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }
}
