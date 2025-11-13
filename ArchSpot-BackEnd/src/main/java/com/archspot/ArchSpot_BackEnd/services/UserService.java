package com.archspot.ArchSpot_BackEnd.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.archspot.ArchSpot_BackEnd.dtos.user.PasswordChangeDTO;
import com.archspot.ArchSpot_BackEnd.dtos.user.UserCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.user.UserUpdateDTO;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.exceptions.DatabaseException;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;
import com.archspot.ArchSpot_BackEnd.templates.services.TemplateService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

	private static final String UPLOAD_DIR = "uploads/profile";

	@Autowired
	private UserRepository repository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private TemplateService templateService;

	// Para consultar todos os usuarios
	public List<User> findAll() {
		return repository.findAll();
	}

	// Para consultar usuario pelo id
	public User findById(Long id) {
		Optional<User> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException("User not found"));
	}

	// Para criar novo usuario
	public User create(UserCreateDTO dto) {
		if (repository.existsByEmail(dto.email())) {
			throw new DatabaseException("E-mail já está em uso");
		}
		if (repository.existsByCpf(dto.cpf())) {
			throw new DatabaseException("CPF já está em uso");
		}

		User user = new User();
		user.setCpf(dto.cpf());
		user.setName(dto.name());
		user.setPhone(dto.phone());
		user.setAddress(dto.address());
		user.setProfession(dto.profession());
		user.setEmail(dto.email());
		user.setPassword(passwordEncoder.encode(dto.password())); // criptografa aqui

		// Salvar imagem (se existir)
		if (dto.profileImage() != null && !dto.profileImage().isEmpty()) {
			try {
				String imagePath = saveProfileImage(dto.profileImage(), dto.email());
				user.setFileUrl(imagePath);
			} catch (IOException e) {
				throw new DatabaseException("Erro ao salvar imagem de perfil");
			}
		}

		try {
			User savedUser = repository.save(user);

			// Clona templates padrão do sistema para o novo usuário
			templateService.cloneDefaultTemplatesForUser(savedUser);

			return savedUser;
		} catch (DataIntegrityViolationException e) {
			throw new DatabaseException("Violação de integridade ao salvar o usuário");
		}
	}

	// Para deletar usuario
	public void delete(Long id) {
		try {
			if (repository.existsById(id)) {
				repository.deleteById(id);
			} else {
				throw new ResourceNotFoundException("User not found");
			}
		} catch (DataIntegrityViolationException e) {
			throw new DatabaseException("Usuário vinculado a projetos não pode ser deletado.");
		}
	}

	// Para atualizar usuario
	public User update(Long id, UserUpdateDTO dto, MultipartFile profileImage) {
		try {
			User user = repository.getReferenceById(id);

			// Verificar senha atual para permitir atualização
			if (dto.password() == null || !passwordEncoder.matches(dto.password(), user.getPassword())) {
				throw new DatabaseException("Senha incorreta");
			}

			// Verificar duplicidade de CPF
			if (!user.getCpf().equals(dto.cpf()) && repository.existsByCpf(dto.cpf())) {
				throw new DatabaseException("CPF já está em uso");
			}

			// Verificar duplicidade de e-mail
			if (!user.getEmail().equals(dto.email()) && repository.existsByEmail(dto.email())) {
				throw new DatabaseException("E-mail já está em uso");
			}

			user.setCpf(dto.cpf());
			user.setName(dto.name());
			user.setPhone(dto.phone());
			user.setAddress(dto.address());
			user.setProfession(dto.profession());
			user.setEmail(dto.email());

			// Atualizar imagem, se enviada
			if (profileImage != null && !profileImage.isEmpty()) {
				try {
					// Deleta imagem antiga, se existir
					if (user.getFileUrl() != null) {
						Path oldImagePath = Paths.get(user.getFileUrl());
						if (Files.exists(oldImagePath)) {
							Files.delete(oldImagePath);
						}
					}

					// Salva nova imagem
					String imagePath = saveProfileImage(profileImage, dto.email());
					user.setFileUrl(imagePath);
				} catch (IOException e) {
					throw new DatabaseException("Erro ao salvar imagem de perfil");
				}
			}

			return repository.save(user);
		} catch (EntityNotFoundException e) {
			throw new ResourceNotFoundException("User not found");
		}
	}

	// Para atualizar senha
	public void changePassword(Long userId, PasswordChangeDTO dto) {
		User user = repository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found"));

		// Valida senha atual
		if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
			throw new DatabaseException("Senha atual incorreta");
		}

		// Atualiza nova senha
		user.setPassword(passwordEncoder.encode(dto.newPassword()));
		repository.save(user);
	}

	/*
	 * MÉTODOS AUXILIARES
	 */

	private String saveProfileImage(MultipartFile file, String email) throws IOException {
		Path uploadPath = Paths.get(UPLOAD_DIR);
		if (!Files.exists(uploadPath)) {
			Files.createDirectories(uploadPath);
		}

		String fileExtension = getFileExtension(file.getOriginalFilename());
		String fileName = email.replaceAll("[^a-zA-Z0-9]", "_") + "_" + System.currentTimeMillis() + "." + fileExtension;
		Path filePath = uploadPath.resolve(fileName);

		Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
		return filePath.toString().replace("\\", "/"); // retorna caminho normalizado
	}

	private String getFileExtension(String filename) {
		int dotIndex = filename.lastIndexOf('.');
		return (dotIndex > 0) ? filename.substring(dotIndex + 1) : "jpg";
	}
}
