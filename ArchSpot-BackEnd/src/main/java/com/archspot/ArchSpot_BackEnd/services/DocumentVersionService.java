package com.archspot.ArchSpot_BackEnd.services;

import com.archspot.ArchSpot_BackEnd.dtos.document.DocumentVersionDTO;
import com.archspot.ArchSpot_BackEnd.entities.Document;
import com.archspot.ArchSpot_BackEnd.entities.DocumentVersion;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.DocumentRepository;
import com.archspot.ArchSpot_BackEnd.repositories.DocumentVersionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentVersionService {

  @Autowired
  private DocumentVersionRepository documentVersionRepository;

  @Autowired
  private DocumentRepository documentRepository;

  public List<DocumentVersionDTO> getVersionsByDocument(Long documentId) {
    Document document = documentRepository.findById(documentId)
        .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

    return documentVersionRepository.findByDocumentOrderByVersionNumberDesc(document)
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  public Path getFilePath(Long versionId) {
  DocumentVersion version = documentVersionRepository.findById(versionId)
      .orElseThrow(() -> new ResourceNotFoundException("Version not found"));

  // Exemplo: fileUrl = "/uploads/projects/12/document_34_v2.pdf"
  String fileUrl = version.getFileUrl();
  if (fileUrl.startsWith("/")) {
    fileUrl = fileUrl.substring(1); // remove barra inicial
  }

  return Paths.get(fileUrl).toAbsolutePath().normalize();
}


  private DocumentVersionDTO toDTO(DocumentVersion version) {
    return DocumentVersionDTO.builder()
        .id(version.getId())
        .versionNumber(version.getVersionNumber())
        .fileUrl(version.getFileUrl())
        .size(version.getSize())
        .uploadedAt(version.getUploadedAt())
        .build();
  }
}
