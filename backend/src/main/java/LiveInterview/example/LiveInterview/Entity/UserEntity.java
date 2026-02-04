package LiveInterview.example.LiveInterview.Entity;

import LiveInterview.example.LiveInterview.DTO.Role;
import jakarta.persistence.*;
import lombok.Data;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class UserEntity implements UserDetails {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Column(nullable = false)
   private String name;

   @Column(nullable = false, unique = true)
   private String email;

   @Column(nullable = false)
   private String password;

   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   private Role role;

   @Column(nullable = false)
   private Boolean enabled = true;

   @Column(nullable = false)
   private LocalDateTime createdDate;

   public UserEntity() {
      // required by JPA
   }
   public UserEntity(String email, String name, String password, Role role, Boolean enabled) {
      this.email = email;
      this.name = name;
      this.password = password;
      this.role = role;
      this.enabled = enabled;
   }

   //  Spring Security methods


   @Override
   public Collection<? extends GrantedAuthority> getAuthorities() {
      return List.of(new SimpleGrantedAuthority( role.name()));
   }

   @Override
   public String getUsername() {
      return email;
   }

   @Override public boolean isAccountNonExpired() { return true; }
   @Override public boolean isAccountNonLocked() { return true; }
   @Override public boolean isCredentialsNonExpired() { return true; }

   @Override
   public boolean isEnabled() {
      return enabled;
   }
}
