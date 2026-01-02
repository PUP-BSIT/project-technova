package com.campus.facility_reservation.controller;

import com.campus.facility_reservation.dto.ContactRequest;
import com.campus.facility_reservation.dto.ResponseDTO;
import com.campus.facility_reservation.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:4200")
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<ResponseDTO<Object>> sendContact(@Valid @RequestBody ContactRequest request) {
        try {
            boolean ok = emailService.sendContactUsEmail(request.getName(), request.getEmail(), request.getMessage());
            if (ok) {
                return ResponseEntity.ok(ResponseDTO.success(null, "Message sent successfully."));
            } else {
                return ResponseEntity.status(500).body(ResponseDTO.error("Failed to send message: email delivery failed."));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDTO.error("Failed to send message: " + e.getMessage()));
        }
    }
}
