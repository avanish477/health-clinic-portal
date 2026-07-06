package com.clinic.clinic_backend.controller;

import com.clinic.clinic_backend.dto.JwtResponse;
import com.clinic.clinic_backend.dto.LoginRequest;
import com.clinic.clinic_backend.dto.SignupRequest;
import com.clinic.clinic_backend.model.DoctorProfile;
import com.clinic.clinic_backend.model.Role;
import com.clinic.clinic_backend.model.User;
import com.clinic.clinic_backend.repository.DoctorProfileRepository;
import com.clinic.clinic_backend.repository.UserRepository;
import com.clinic.clinic_backend.security.JwtUtils;
import com.clinic.clinic_backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DoctorProfileRepository doctorProfileRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 userDetails.getEmail(), 
                                                 role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Email is already in use!");
        }

        Role userRole = Role.ROLE_PATIENT;
        if ("doctor".equalsIgnoreCase(signUpRequest.getRole())) {
            userRole = Role.ROLE_DOCTOR;
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .password(encoder.encode(signUpRequest.getPassword()))
                .email(signUpRequest.getEmail())
                .firstName(signUpRequest.getFirstName())
                .lastName(signUpRequest.getLastName())
                .role(userRole)
                .build();

        User savedUser = userRepository.save(user);

        if (userRole == Role.ROLE_DOCTOR) {
            String defaultSlots = "09:00 AM;10:00 AM;11:00 AM;02:00 PM;03:00 PM;04:00 PM";
            DoctorProfile doctorProfile = DoctorProfile.builder()
                    .user(savedUser)
                    .specialization(signUpRequest.getSpecialization() != null ? signUpRequest.getSpecialization() : "General Physician")
                    .description(signUpRequest.getDescription() != null ? signUpRequest.getDescription() : "Experienced healthcare provider.")
                    .rating(4.5)
                    .availableSlots(defaultSlots)
                    .build();
            doctorProfileRepository.save(doctorProfile);
        }

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null) {
            return ResponseEntity.badRequest().body("Error: Email is required!");
        }

        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = java.util.UUID.randomUUID().toString();
            user.setResetToken(token);
            userRepository.save(user);

            String resetLink = "http://localhost:4200/login?token=" + token;
            System.out.println("=================================================================");
            System.out.println("PASSWORD RESET REQUEST RECEIVED FOR: " + email);
            System.out.println("RESET LINK: " + resetLink);
            System.out.println("=================================================================");
        }

        return ResponseEntity.ok("If an account with that email exists, a password reset link has been printed to the server console!");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");

        if (token == null || newPassword == null) {
            return ResponseEntity.badRequest().body("Error: Token and new password are required!");
        }

        java.util.Optional<User> userOpt = userRepository.findByResetToken(token);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Invalid or expired password reset token!");
        }

        User user = userOpt.get();
        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);

        return ResponseEntity.ok("Password has been reset successfully!");
    }
}
