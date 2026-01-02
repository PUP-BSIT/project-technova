package com.campus.facility_reservation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campus.facility_reservation.dto.AuthResponse;
import com.campus.facility_reservation.dto.ForgotPasswordRequest;
import com.campus.facility_reservation.dto.LoginRequest;
import com.campus.facility_reservation.dto.RefreshTokenRequest;
import com.campus.facility_reservation.dto.RegisterRequest;
import com.campus.facility_reservation.dto.ResetPasswordRequest;
import com.campus.facility_reservation.dto.ValidateTokenRequest;
import com.campus.facility_reservation.repository.UserRepository;
import com.campus.facility_reservation.service.AuthService;
import com.campus.facility_reservation.service.PasswordResetService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetService passwordResetService;

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
        boolean isAvailable = !userRepository.existsByPhoneNumber(phoneNumber);
        return ResponseEntity.ok(isAvailable);
    }

    @GetMapping("/check-student-id")
    public ResponseEntity<Boolean> checkStudentIdAvailability(@RequestParam String studentId) {
        boolean isAvailable = !userRepository.existsByStudentId(studentId.trim());
        return ResponseEntity.ok(isAvailable);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String contactMethod = request.getContactMethod() != null ? request.getContactMethod() : "email";
            passwordResetService.createPasswordResetToken(contactMethod, request.getEmail(), request.getPhone());
            
            String message = "email".equals(contactMethod) 
                ? "If an account exists with this email, a verification code has been sent."
                : "If an account exists with this phone number, a verification code has been sent.";
            
            AuthResponse resp = new AuthResponse(null, null, message);
            resp.setSuccess(true);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            String contactMethod = request.getContactMethod() != null ? request.getContactMethod() : "email";
            String message = "email".equals(contactMethod) 
                ? "If an account exists with this email, a verification code has been sent."
                : "If an account exists with this phone number, a verification code has been sent.";
            
            AuthResponse resp = new AuthResponse(null, null, message);
            resp.setSuccess(true);
            return ResponseEntity.ok(resp);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            AuthResponse resp = new AuthResponse(null, null, "Password reset successful.");
            resp.setSuccess(true);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Failed: " + e.getMessage()));
        }
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestBody ValidateTokenRequest request) {
        try {
            passwordResetService.validateTokenAndGetUser(request.getToken());
            AuthResponse resp = new AuthResponse(null, null, "Token valid.");
            resp.setSuccess(true);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Invalid token: " + e.getMessage()));
        }
    }
}