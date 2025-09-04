package com.archspot.ArchSpot_BackEnd.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.archspot.ArchSpot_BackEnd.dtos.LoginRequestDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserCreateDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserDTO;
import com.archspot.ArchSpot_BackEnd.dtos.UserUpdateDTO;
import com.archspot.ArchSpot_BackEnd.entities.User;
import com.archspot.ArchSpot_BackEnd.repositories.UserRepository;
import com.archspot.ArchSpot_BackEnd.services.exceptions.DatabaseException;
import com.archspot.ArchSpot_BackEnd.services.exceptions.ResourceNotFoundException;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserService {

	@Autowired
	private UserRepository repository;

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
		User obj = new User();
		obj.setCpf(dto.cpf());
		obj.setName(dto.name());
		obj.setPhone(dto.phone());
		obj.setAddress(dto.address());
		obj.setProfession(dto.profession());
		obj.setEmail(dto.email());
		obj.setUserRole(dto.userRole());
		obj.setPassword(dto.password());
		return repository.save(obj);
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
			user.setUserRole(dto.userRole());
			user.setPassword(dto.password());
			return repository.save(user);
		} catch (EntityNotFoundException e) {
			throw new ResourceNotFoundException(id);
		}

	}

	/*
	 * Autentica o usuário pelas credenciais.
	 * 
	 * @return Optional.empty() se inválido, ou UserDTO se válido.
	 */
	public Optional<UserDTO> authenticate(LoginRequestDTO creds) {
		return repository
				.findByEmailAndPassword(creds.email(), creds.password())
				.map(u -> new UserDTO(u.getId(), u.getName(), u.getEmail(), u.getUserRole()));
	}

}
