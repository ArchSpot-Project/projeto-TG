package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.activities.services.handlers.PhotoActivityHandler;
import com.archspot.ArchSpot_BackEnd.dtos.photo.PhotoDTO;
import com.archspot.ArchSpot_BackEnd.entities.Album;
import com.archspot.ArchSpot_BackEnd.entities.Photo;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.AlbumRepository;
import com.archspot.ArchSpot_BackEnd.repositories.PhotoRepository;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.utils.ProjectPermissionUtils;

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
  private PhotoActivityHandler photoActivityHandler;

  // listar por álbum
  public List<PhotoDTO> findByAlbum(Long albumId) {
    albumRepository.findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));

    return photoRepository.findByAlbumId(albumId).stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  // upload (cria registro + salva arquivo)
  @Transactional
  public PhotoDTO uploadPhoto(Long albumId, MultipartFile file, String optionalName)
      throws IOException {
    User currentUser = SecurityUtils.getCurrentUser();

    Album album = albumRepository.findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));

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
        .uploadedBy(currentUser)
        .build();

    Photo saved = photoRepository.save(photo);

    photoActivityHandler.uploaded(
        SecurityUtils.getCurrentUser(),
        album.getProject(),
        photo.getName(),
        album.getName(),
        photo.getFileUrl());
    return toDTO(saved);
  }

  // atualizar metadados (nome)
  public PhotoDTO updateMetadata(Long id, String newName) {
    Photo photo = photoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));

    String oldName = photo.getName();

    if (newName != null && !newName.isBlank()) {
      photo.setName(newName);
    }
    Photo updated = photoRepository.save(photo);

    photoActivityHandler.updated(
        SecurityUtils.getCurrentUser(),
        photo.getAlbum().getProject(),
        oldName,
        photo.getName(),
        photo.getAlbum().getName(),
        photo.getFileUrl());
    return toDTO(updated);
  }

  // deletar (remove db + arquivo físico)
  @Transactional
  public void delete(Long id) {
    Photo photo = photoRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));

    // Usuário autenticado (vem do token)
    User currentUser = SecurityUtils.getCurrentUser();

    // Resgata o projeto associado (documento > diretório > projeto)
    Project project = photo.getAlbum().getProject();

    String albumName = photo.getAlbum().getName();
    String photoName = photo.getName();

    // Verifica se o usuário é dono do comentário
    boolean isOwner = photo.getUploadedBy().getId().equals(currentUser.getId());

    // Verifica se o usuário é ADMIN ou STAFF no projeto
    boolean isProjectAdminOrStaff = ProjectPermissionUtils.isAdminOrStaff(project, currentUser);

    if (!isOwner && !isProjectAdminOrStaff) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not allowed to delete this photo");
    }

    Path p = Paths.get(photo.getFileUrl());
    try {
      Files.deleteIfExists(p);
    } catch (IOException ignored) {
    }

    photoRepository.delete(photo);
    photoActivityHandler.deleted(
        SecurityUtils.getCurrentUser(),
        project,
        photoName,
        albumName);
  }

  // buscar por id
  public PhotoDTO findById(Long id) {
    return photoRepository.findById(id).map(this::toDTO)
        .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));
  }

  // retorna path para download
  public Path getFilePath(Long photoId) {
    Photo photo = photoRepository.findById(photoId)
        .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));
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
