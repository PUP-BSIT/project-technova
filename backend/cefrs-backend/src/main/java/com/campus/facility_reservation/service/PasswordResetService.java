package com.campus.facility_reservation.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campus.facility_reservation.model.PasswordResetToken;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.repository.PasswordResetTokenRepository;
import com.campus.facility_reservation.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;

    private static final int EXPIRATION_MINUTES = 15;

    @Transactional
    public void createPasswordResetToken(String email) throws Exception {
        createPasswordResetToken("email", email, null);
    }

    @Transactional
    public void createPasswordResetToken(String contactMethod, String email, String phone) throws Exception {
        Optional<User> userOpt;
        
        if ("phone".equals(contactMethod)) {
            // Validate phone input
            if (phone == null || phone.trim().isEmpty()) {
                log.warn("Phone number is empty or null");
                return; // Silently fail - don't reveal if user exists
            }
            
            String cleanPhone = phone.replaceAll("\\D", "");
            log.info("Looking up user by phone: {}", cleanPhone);
            
            userOpt = userRepository.findByPhoneNumber(cleanPhone);
            
            if (userOpt.isEmpty()) {
                log.warn("No user found with phone number: {}", cleanPhone);
                return; // Silently fail - don't reveal if user exists
            }
        } else {
            // Validate email input
            if (email == null || email.trim().isEmpty()) {
                log.warn("Email is empty or null");
                return; // Silently fail
            }
            
            log.info("Looking up user by email: {}", email);
            userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                log.warn("No user found with email: {}", email);
                return; // Silently fail
            }
        }

        User user = userOpt.get();
        String code = generateVerificationCode();

        LocalDateTime expiry = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
        PasswordResetToken token = new PasswordResetToken(code, user, expiry);
        tokenRepository.save(token);

        log.info("Password reset token created for user: {}", user.getEmail());

        // Send code via email or SMS based on contact method
        if ("phone".equals(contactMethod)) {
            String cleanPhone = phone.replaceAll("\\D", "");
            log.info("Attempting to send SMS to: {}", cleanPhone);
            boolean smsSent = smsService.sendVerificationCode(cleanPhone, code);
            
            if (!smsSent) {
                log.error("Failed to send SMS verification code to: {}", cleanPhone);
                // Don't throw exception - silently fail for security
            } else {
                log.info("SMS verification code sent successfully to: {}", cleanPhone);
            }
        } else {
            log.info("Attempting to send email to: {}", user.getEmail());
            try {
                emailService.sendPasswordResetEmail(user, code);
                log.info("Email verification code sent successfully to: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send email verification code to: {}", user.getEmail(), e);
                // Don't throw exception - silently fail for security
            }
        }
    }

    @Transactional
    public User validateTokenAndGetUser(String token) throws Exception {
        Optional<PasswordResetToken> t = tokenRepository.findByToken(token);
        if (t.isEmpty()) {
            throw new Exception("Invalid verification code");
        }

        PasswordResetToken prt = t.get();
        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(prt);
            throw new Exception("Verification code expired");
        }

        return prt.getUser();
    }

    @Transactional
    public void resetPassword(String token, String newPassword) throws Exception {
        User user = validateTokenAndGetUser(token);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.deleteByToken(token);
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    private String generateVerificationCode() {
        Random rnd = new Random();
        int number = rnd.nextInt(1_000_000);
        return String.format("%06d", number);
    }
}