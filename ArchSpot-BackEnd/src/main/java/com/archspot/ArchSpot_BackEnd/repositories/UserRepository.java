package com.archspot.ArchSpot_BackEnd.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.archspot.ArchSpot_BackEnd.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	Optional<User> findByEmailAndPassword(String email, String password);
}
