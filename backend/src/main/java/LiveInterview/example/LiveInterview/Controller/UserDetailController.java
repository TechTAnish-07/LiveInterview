package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.UserResponse;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/userdetail")
public class UserDetailController {
    private final UserRepo userRepo;
    @Autowired
    public UserDetailController(UserRepo userRepo) {
        this.userRepo = userRepo;
    }
    @GetMapping("/me")
    ResponseEntity<?> getCurrentUser(Principal principal){
        UserEntity user = userRepo.findByEmail(principal.getName())
                .orElseThrow();
        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
        return ResponseEntity.ok(response);
    }
}
