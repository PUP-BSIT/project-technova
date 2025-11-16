package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.RegisterRequest;
import com.campus.facility_reservation.dto.UpdateProfileRequest;
import com.campus.facility_reservation.dto.UserResponse;
import com.campus.facility_reservation.service.AuthService;
import com.campus.facility_reservation.dto.ChangePasswordRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private AuthService authService;

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        try {
            Long userId = (Long) authentication.getPrincipal();
            UserResponse user = authService.getUserProfile(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching profile: " + e.getMessage());
        }
    }

    @PatchMapping("/update")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUserProfile(Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            Long userId = (Long) authentication.getPrincipal();
            UserResponse user = authService.updateUserProfile(userId, request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating profile: " + e.getMessage());
        }
    }

    @PatchMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        try {
            Long userId = (Long) authentication.getPrincipal();
            authService.changePassword(userId, request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error changing password: " + e.getMessage());
        }
    }
}