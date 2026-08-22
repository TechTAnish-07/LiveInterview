package LiveInterview.example.LiveInterview.Repository;

import LiveInterview.example.LiveInterview.DTO.Role;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(Role role);

    List<UserEntity> findByRole(Role role);
}

