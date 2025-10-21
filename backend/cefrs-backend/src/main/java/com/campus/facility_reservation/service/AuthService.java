package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.Role;
import com.campus.facility_reservation.model.RoleType;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.repository.RoleRepository;
import com.campus.facility_reservation.repository.UserRepository;
import com.campus.facility_reservation.security.JwtTokenProvider;
import com.campus.facility_reservation.dto.RegisterRequest;
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

                // 2. CHECK: Prevent Null/Empty Role from Causing Crash (The Fix for 'No enum
                // constant')
                if (roleString == null || roleString.trim().isEmpty()) {
                        // Throw an explicit error to indicate that the frontend needs to supply the
                        // role
                        throw new RuntimeException("Registration failed: Role type is missing.");
                }

                // 3. Clean the role string: Trim spaces and convert to ALL CAPS for safe enum
                // matching
                roleString = roleString.trim().toUpperCase();

                // 4. Convert to Enum and Find Role Entity
                RoleType roleType;
                try {
                        roleType = RoleType.valueOf(roleString);
                } catch (IllegalArgumentException e) {
                        // Catch the specific error thrown by RoleType.valueOf() if the string is
                        // invalid
                        throw new RuntimeException("Registration failed: Invalid role type specified.", e);
                }

                Role role = roleRepository.findByName(roleType)
                                .orElseThrow(() -> new RuntimeException("Role not found: " + roleType.toString()));

                // --- User Object Creation ---
                User user = new User();
                user.setEmail(request.getEmail());
                user.setPassword(passwordEncoder.encode(request.getPassword()));

                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setPhoneNumber(request.getPhoneNumber());
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
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

                // Check if user is active
                if (!user.getIsActive()) {
                        throw new RuntimeException("User account has been deactivated");
                }

                // Verify password
                if (!passwordEncoder.matches(password, user.getPassword())) {
                        throw new RuntimeException("Invalid email or password");
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
        public UserResponse updateUserProfile(Long userId, RegisterRequest request) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                user.setFirstName(request.getFirstName());
                user.setLastName(request.getLastName());
                user.setPhoneNumber(request.getPhoneNumber());
                user.setOrganizationName(request.getOrganizationName());
                user.setUpdatedAt(LocalDateTime.now());

                userRepository.save(user);
                return new UserResponse(user);
        }
}