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
    // Assuming the method signature uses RegisterRequest, not AuthRequest
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already registered");
        }
        
        RoleType roleType = RoleType.valueOf(request.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // User fields added from the updated RegisterRequest DTO
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setOrganizationName(request.getOrganizationName());

        user.setRole(role);
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
        
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
    // Assuming the method signature uses RegisterRequest, not AuthRequest
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