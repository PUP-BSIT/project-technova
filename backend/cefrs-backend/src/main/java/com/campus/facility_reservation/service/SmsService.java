package com.campus.facility_reservation.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.sms.api-key:7fa04f5a6e914de047638cb913480e64}")
    private String smsApiKey;

    @Value("${app.sms.api-url:https://api.semaphore.co/api/v4/messages}")
    private String smsApiUrl;
    public boolean sendVerificationCode(String phoneNumber, String code) {
        try {
            String cleanPhone = phoneNumber.replaceAll("\\D", "");
            
            // Ensure phone number starts with country code (e.g., 63 for Philippines)
            // Format message
            String message = "Your CEFRS password reset code is: " + code + ". Valid for 15 minutes.";
            
            // Prepare form-urlencoded request body for Semaphore API
            MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
            requestBody.add("apikey", smsApiKey);
            requestBody.add("number", cleanPhone);
            requestBody.add("message", message);
            
            // Set headers - Semaphore uses application/x-www-form-urlencoded
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(requestBody, headers);
            
            // Send request to Semaphore API
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                smsApiUrl, 
                HttpMethod.POST, 
                request, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("SMS verification code sent successfully to {}", phoneNumber);
                return true;
            } else {
                log.error("Failed to send SMS: HTTP status {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Error sending SMS to {}: {}", phoneNumber, e.getMessage(), e);
            return false;
        }
    }
}

