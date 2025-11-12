package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.Role;
import com.campus.facility_reservation.model.RoleType;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.repository.RoleRepository;
import com.campus.facility_reservation.repository.UserRepository;
import com.campus.facility_reservation.security.JwtTokenProvider;
import com.campus.facility_reservation.dto.RegisterRequest;
import com.campus.facility_reservation.dto.UpdateProfileRequest;
import com.campus.facility_reservation.dto.AuthResponse;
import com.campus.facility_reservation.dto.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private RoleRepository roleRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtTokenProvider jwtTokenProvider;

        // Register new user
        public AuthResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already registered");
                }

                // 1. Retrieve and Clean the Role String
                String roleString = request.getRole();

                // 2. CHECK: Prevent Null/Empty Role from Causing Crash
                if (roleString == null || roleString.trim().isEmpty()) {
                        // role
                        throw new RuntimeException("Registration failed: Role type is missing.");
                }

                // 3. Clean the role string
                roleString = roleString.trim().toUpperCase();

                // 4. Resolve role by numeric id OR alias mapping -> enum -> entity
                Role role;

                // 4a. If numeric, treat as role_id
                if (roleString.matches("\\d+")) {
                        Long roleId = Long.parseLong(roleString);
                        role = roleRepository.findById(roleId)
                                        .orElseThrow(() -> new RuntimeException("Role not found by id: " + roleId));
                } else {
                        // 4b. Map common aliases to enum names
                        String normalizedRole = roleString;
                        if ("ADMIN".equals(normalizedRole)) {
                                normalizedRole = "ADMINISTRATOR";
                        } else if ("ORGANIZATION".equals(normalizedRole)) {
                                normalizedRole = "CAMPUS_ORGANIZATION";
                        }

                        RoleType roleType;
                        try {
                                roleType = RoleType.valueOf(normalizedRole);
                        } catch (IllegalArgumentException e) {
                                throw new RuntimeException(
                                                "Registration failed: Invalid role type specified.");
                        }

                        role = roleRepository.findByName(roleType)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Role not found: " + roleType.toString()));
                }

                // --- User Object Creation ---
                User user = new User();
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));

                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setPhoneNumber(request.getPhoneNumber());

                user.setAddress(request.getAddress());
                user.setStudentId(request.getStudentId());
                user.setOrganizationName(request.getOrganizationName());

                user.setRole(role);
                user.setIsActive(true);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());

                userRepository.save(user);

                // --- Token Generation ---
                String accessToken = jwtTokenProvider.generateAccessToken(user.getId(),
                                user.getEmail(), user.getRole().getName().toString());
                String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(),
                                user.getEmail());

                return new AuthResponse(accessToken, refreshToken, "User registered successfully",
                                user.getId(), user.getRole().getName().toString());
        }

        // Login user (assuming AuthRequest or separate DTO is used here)
        public AuthResponse login(String email, String password) {
                // Find user by email
                Optional<User> userOptional = userRepository.findByEmail(email);
                
                // Check if email is registered
                if (userOptional.isEmpty()) {
                        throw new RuntimeException("Email not registered. Please sign up first.");
                }
                
                User user = userOptional.get();

                // Check if user is active
                if (!user.getIsActive()) {
                        throw new RuntimeException("User account has been deactivated");
                }

                // Verify password
                if (!passwordEncoder.matches(password, user.getPassword())) {
                        throw new RuntimeException("Incorrect password. Please try again.");
                }

                // Update last login
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);

                // Generate tokens
                String accessToken = jwtTokenProvider.generateAccessToken(user.getId(),
                                user.getEmail(), user.getRole().getName().toString());
                String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(),
                                user.getEmail());

                return new AuthResponse(accessToken, refreshToken, "Login successful",
                                user.getId(), user.getRole().getName().toString());
        }

        // Refresh access token
        public AuthResponse refreshToken(String refreshToken) {
                if (!jwtTokenProvider.validateToken(refreshToken)) {
                        throw new RuntimeException("Invalid or expired refresh token");
                }

                Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
                String email = jwtTokenProvider.getEmailFromToken(refreshToken);

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(),
                                user.getEmail(), user.getRole().getName().toString());

                return new AuthResponse(newAccessToken, refreshToken, "Token refreshed successfully",
                                user.getId(), user.getRole().getName().toString());
        }

        // Get user profile
        public UserResponse getUserProfile(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return new UserResponse(user);
        }

        // Update user profile
        public UserResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // Only update the fields that are allowed to change
                user.setPhoneNumber(request.getPhoneNumber());
                user.setEmail(request.getEmail());
                user.setAddress(request.getAddress());
                user.setUpdatedAt(LocalDateTime.now());

                userRepository.save(user);
                return new UserResponse(user);
        }
}