package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.UserResponse;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<UserResponse> userResponses = users.stream()
                    .map(UserResponse::new)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(userResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching users: " + e.getMessage());
        }
    }
    
    @PutMapping("/users/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setIsActive(false);
            userRepository.save(user);
            return ResponseEntity.ok(new UserResponse(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deactivating user: " + e.getMessage());
        }
    }
    
    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> activateUser(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setIsActive(true);
            userRepository.save(user);
            return ResponseEntity.ok(new UserResponse(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error activating user: " + e.getMessage());
        }
    }
}