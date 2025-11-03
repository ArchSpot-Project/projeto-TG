package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.dtos.user.UserCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.user.UserUpdateDTO;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.exceptions.DatabaseException;
import com.archspot.ArchSpot_BackEnd.exceptions.ResourceNotFoundException;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

	@Autowired
	private UserRepository repository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	// Para consultar todos os usuarios
	public List<User> findAll() {
		return repository.findAll();
	}

	// Para consultar usuario pelo id
	public User findById(Long id) {
		Optional<User> obj = repository.findById(id);
		return obj.orElseThrow(() -> new ResourceNotFoundException(id));
	}

	// Para criar novo usuario
	public User create(UserCreateDTO dto) {
		User user = new User();
		user.setCpf(dto.cpf());
		user.setName(dto.name());
		user.setPhone(dto.phone());
		user.setAddress(dto.address());
		user.setProfession(dto.profession());
		user.setEmail(dto.email());
		user.setPassword(passwordEncoder.encode(dto.password())); // criptografa aqui
		return repository.save(user);
	}

	// Para deletar usuario
	public void delete(Long id) {

		try {
			if (repository.existsById(id)) {
				repository.deleteById(id);
			} else {
				throw new ResourceNotFoundException(id);
			}
		} catch (DataIntegrityViolationException e) {
			throw new DatabaseException("Usuario já vinculado a um projeto nao podem ser deletados");
		}
	}

	// Para atualizar usuario
	public User update(Long id, UserUpdateDTO dto) {
		try {
			User user = repository.getReferenceById(id);
			user.setCpf(dto.cpf());
			user.setName(dto.name());
			user.setPhone(dto.phone());
			user.setAddress(dto.address());
			user.setProfession(dto.profession());
			user.setEmail(dto.email());
			user.setPassword(dto.password());
			return repository.save(user);
		} catch (EntityNotFoundException e) {
			throw new ResourceNotFoundException(id);
		}

	}
}
