package com.campus.facility_reservation.service;

import com.campus.facility_reservation.dto.RegisterRequest;
import com.campus.facility_reservation.dto.LoginRequest;
import com.campus.facility_reservation.dto.AuthResponse;
import com.campus.facility_reservation.model.Role;        // <-- NEW
import com.campus.facility_reservation.model.RoleType;    // <-- NEW
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.repository.RoleRepository; // <-- NEW
import com.campus.facility_reservation.repository.UserRepository;
import com.campus.facility_reservation.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository; // <-- Added dependency for role lookup
    // private final JwtUtil jwtUtil;

    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return "Email already in use";
        }

        // --- FIX FOR COMPILATION ERROR STARTS HERE ---
       // 1. Convert the incoming role String (e.g., "STUDENT") to the enum
        RoleType roleType = RoleType.valueOf(request.getRole().toUpperCase());

        // 2. Find the Role entity using the RoleType enum directly
        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role); // <-- Now setting the correct Role entity
        // Note: You may want to set other fields (firstName, lastName, etc.) here
        // if this method is intended for full registration.
        // Assuming AuthService handles the full fields, only basic fields are set here.

        // --- FIX FOR COMPILATION ERROR ENDS HERE ---

        userRepository.save(user);
        return "User registered successfully";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Create AuthResponse using the no-arg constructor and setters
        AuthResponse response = new AuthResponse();
        response.setAccessToken("dummy-token");
        response.setMessage("Login successful");
        return response;

        // String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        // AuthResponse response = new AuthResponse();
        // response.setAccessToken(token);
        // response.setMessage("Login successful");
        // response.setUserId(user.getId());
        // response.setRole(user.getRole().getName());
        // return response;
    }
}