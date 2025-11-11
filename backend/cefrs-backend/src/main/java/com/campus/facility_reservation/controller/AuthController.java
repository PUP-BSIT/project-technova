package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.RegisterRequest;
import com.campus.facility_reservation.dto.AuthResponse;
import com.campus.facility_reservation.dto.LoginRequest;
import com.campus.facility_reservation.dto.RefreshTokenRequest;
import com.campus.facility_reservation.service.AuthService;
import com.campus.facility_reservation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new AuthResponse(null, null, "Token refresh failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity
                .ok(new AuthResponse(null, null, "Logout successful. Please remove tokens from client storage."));
    }

    @GetMapping("/check-phone")
    public ResponseEntity<Boolean> checkPhoneAvailability(@RequestParam String phoneNumber) {
        // This line now correctly uses the injected 'userRepository'
        boolean isAvailable = !userRepository.existsByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(isAvailable);
    }
}