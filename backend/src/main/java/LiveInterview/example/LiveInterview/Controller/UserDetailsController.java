package LiveInterview.example.LiveInterview.Controller;

import LiveInterview.example.LiveInterview.DTO.UserResponse;
import LiveInterview.example.LiveInterview.Entity.UserEntity;
import LiveInterview.example.LiveInterview.Service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/user-details")
public class UserDetailsController {
  private final CustomUserDetailsService userDetailsService;
  @Autowired
  public UserDetailsController(CustomUserDetailsService userDetailsService) {
      this.userDetailsService = userDetailsService ;
  }
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Principal principal
    ) {
        UserEntity user = userDetailsService.getUserFromPrincipal(principal);
        UserResponse response = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
        return ResponseEntity.ok(response);
    }
}
