package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.album.AlbumCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.album.AlbumDTO;
import com.archspot.ArchSpot_BackEnd.dtos.photo.PhotoDTO;
import com.archspot.ArchSpot_BackEnd.entities.Album;
import com.archspot.ArchSpot_BackEnd.entities.Project;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.AlbumRepository;
import com.archspot.ArchSpot_BackEnd.repositories.ProjectRepository;
import com.archspot.ArchSpot_BackEnd.security.SecurityUtils;
import com.archspot.ArchSpot_BackEnd.utils.ProjectPermissionUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class AlbumService {

  @Autowired
  private AlbumRepository albumRepository;

  @Autowired
  private ProjectRepository projectRepository;

  // criar
  public AlbumDTO createAlbum(AlbumCreateDTO dto) {
    Project project = projectRepository.findById(dto.getProjectId())
        .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

    Album album = Album.builder()
        .name(dto.getName())
        .description(dto.getDescription())
        .creationDate(LocalDateTime.now())
        .uploadedBy(SecurityUtils.getCurrentUser())
        .project(project)
        .build();

    Album saved = albumRepository.save(album);
    return toDTO(saved, true);
  }

  // listar por projeto
  public List<AlbumDTO> findByProject(Long projectId) {
    projectRepository.findById(projectId)
        .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

    return albumRepository.findByProjectId(projectId).stream()
        .map(a -> toDTO(a, false)) // false = don't eagerly fetch photos (but we can include them)
        .collect(Collectors.toList());
  }

  // buscar por id
  public AlbumDTO findById(Long id) {
    Album album = albumRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
    return toDTO(album, true);
  }

  // atualizar name/description
  public AlbumDTO update(Long id, AlbumCreateDTO dto) {
    Album album = albumRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
    if (dto.getName() != null)
      album.setName(dto.getName());
    if (dto.getDescription() != null)
      album.setDescription(dto.getDescription());
    Album updated = albumRepository.save(album);
    return toDTO(updated, true);
  }

  // deletar - cascade fotos por JPA; também tentamos remover pasta (silencioso)
  public void delete(Long id) {
    Album album = albumRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found"));

    // Usuário autenticado (vem do token)
    User currentUser = SecurityUtils.getCurrentUser();

    // Verifica se o usuário é dono do album
    boolean isOwner = album.getUploadedBy().getId().equals(currentUser.getId());

    // Resgata o projeto associado (album > projeto)
    Project project = album.getProject();

    // Verifica se o usuário é ADMIN ou STAFF no projeto
    boolean isProjectAdminOrStaff = ProjectPermissionUtils.isAdminOrStaff(project, currentUser);

    if (!isOwner && !isProjectAdminOrStaff) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User not allowed to delete this album");
    }

    // optional: try remove physical folder (best-effort)
    try {
      // build path: uploads/project_{id}/albums/album_{albumId}
      java.nio.file.Path albumDir = java.nio.file.Paths.get("uploads",
          "project_" + album.getProject().getId(),
          "albums",
          "album_" + album.getId());
      if (java.nio.file.Files.exists(albumDir)) {
        java.nio.file.Files.walk(albumDir)
            .sorted(java.util.Comparator.reverseOrder())
            .map(java.nio.file.Path::toFile)
            .forEach(java.io.File::delete);
      }
    } catch (Exception ignored) {
    }

    albumRepository.delete(album);
  }

  // mappers
  private AlbumDTO toDTO(Album album, boolean includePhotos) {
    AlbumDTO dto = AlbumDTO.builder()
        .id(album.getId())
        .name(album.getName())
        .description(album.getDescription())
        .creationDate(album.getCreationDate())
        .uploadedById(album.getUploadedBy().getId())
        .projectId(album.getProject() != null ? album.getProject().getId() : null)
        .build();

    if (includePhotos && album.getPhotos() != null) {
      List<PhotoDTO> photos = album.getPhotos().stream()
          .map(p -> PhotoDTO.builder()
              .id(p.getId())
              .name(p.getName())
              .uploadDate(p.getUploadDate())
              .fileUrl(p.getFileUrl())
              .size(p.getSize())
              .albumId(album.getId())
              .uploadedById(p.getUploadedBy() != null ? p.getUploadedBy().getId() : null)
              .build())
          .collect(Collectors.toList());
      dto.setPhotos(photos);
    } else {
      dto.setPhotos(new ArrayList<>());
    }
    return dto;
  }
}
