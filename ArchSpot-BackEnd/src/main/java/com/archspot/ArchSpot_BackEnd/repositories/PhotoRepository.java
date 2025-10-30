package com.archspot.ArchSpot_BackEnd.repositories;

import com.archspot.ArchSpot_BackEnd.entities.Photo;
import com.archspot.ArchSpot_BackEnd.entities.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
  List<Photo> findByAlbumId(Long albumId);

  List<Photo> findByUploadedById(Long userId);

  List<Photo> findByAlbum(Album album);
}