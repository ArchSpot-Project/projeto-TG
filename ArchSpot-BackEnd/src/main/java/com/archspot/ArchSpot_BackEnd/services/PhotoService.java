package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.PhotoDTO;
import com.archspot.ArchSpot_BackEnd.entities.Album;
import com.archspot.ArchSpot_BackEnd.entities.Photo;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.repositories.AlbumRepository;
import com.archspot.ArchSpot_BackEnd.repositories.PhotoRepository;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhotoService {

  private static final String UPLOAD_BASE = "uploads";

  @Autowired
  private PhotoRepository photoRepository;

  @Autowired
  private AlbumRepository albumRepository;

  @Autowired
  private UserRepository userRepository;

  // listar por álbum
  public List<PhotoDTO> findByAlbum(Long albumId) {
    albumRepository.findById(albumId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));

    return photoRepository.findByAlbumId(albumId).stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // upload (cria registro + salva arquivo)
  @Transactional
  public PhotoDTO uploadPhoto(Long albumId, Long uploadedById, MultipartFile file, String optionalName)
      throws IOException {
    Album album = albumRepository.findById(albumId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));

    User user = userRepository.findById(uploadedById)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    if (file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
    }

    // valida upload apenas para arquivos do tipo imagem
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
      throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only image files are allowed");
    }

    // build upload directory: uploads/project_{projectId}/albums/album_{albumId}
    Path uploadDir = Paths.get(UPLOAD_BASE,
        "project_" + album.getProject().getId(),
        "albums",
        "album_" + album.getId());
    Files.createDirectories(uploadDir);

    String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    Path destination = uploadDir.resolve(filename);
    Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

    Photo photo = Photo.builder()
        .name(optionalName != null ? optionalName : file.getOriginalFilename())
        .uploadDate(LocalDateTime.now())
        .fileUrl(destination.toString())
        .size(file.getSize())
        .album(album)
        .uploadedBy(user)
        .build();

    Photo saved = photoRepository.save(photo);
    return toDTO(saved);
  }

  // atualizar metadados (nome)
  public PhotoDTO updateMetadata(Long id, String newName) {
    Photo photo = photoRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));

    if (newName != null && !newName.isBlank()) {
      photo.setName(newName);
    }
    Photo updated = photoRepository.save(photo);
    return toDTO(updated);
  }

  // deletar (remove db + arquivo físico)
  @Transactional
  public void delete(Long id) {
    Photo photo = photoRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));

    Path p = Paths.get(photo.getFileUrl());
    try {
      Files.deleteIfExists(p);
    } catch (IOException ignored) {
    }

    photoRepository.delete(photo);
  }

  // buscar por id
  public PhotoDTO findById(Long id) {
    return photoRepository.findById(id).map(this::toDTO)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
  }

  // retorna path para download
  public Path getFilePath(Long photoId) {
    Photo photo = photoRepository.findById(photoId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
    return Paths.get(photo.getFileUrl());
  }

  private PhotoDTO toDTO(Photo photo) {
    return PhotoDTO.builder()
        .id(photo.getId())
        .name(photo.getName())
        .uploadDate(photo.getUploadDate())
        .fileUrl(photo.getFileUrl())
        .size(photo.getSize())
        .albumId(photo.getAlbum() != null ? photo.getAlbum().getId() : null)
        .uploadedById(photo.getUploadedBy() != null ? photo.getUploadedBy().getId() : null)
        .build();
  }
}
