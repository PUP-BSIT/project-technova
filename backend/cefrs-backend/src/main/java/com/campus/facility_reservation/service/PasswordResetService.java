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

@Service
@RequiredArgsConstructor
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
            if (phone == null || phone.trim().isEmpty()) {
                throw new Exception("Phone number is required");
            }
            String cleanPhone = phone.replaceAll("\\D", "");
            userOpt = userRepository.findByPhoneNumber(cleanPhone);
            if (userOpt.isEmpty()) {
                throw new Exception("No user found with that phone number");
            }
        } else {
            if (email == null || email.trim().isEmpty()) {
                throw new Exception("Email is required");
            }
            userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                throw new Exception("No user found with that email");
            }
        }

        User user = userOpt.get();
        String code = generateVerificationCode();

        LocalDateTime expiry = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);
        PasswordResetToken token = new PasswordResetToken(code, user, expiry);
        tokenRepository.save(token);

        // Send code via email or SMS based on contact method
        if ("phone".equals(contactMethod)) {
            String cleanPhone = phone.replaceAll("\\D", "");
            boolean smsSent = smsService.sendVerificationCode(cleanPhone, code);
            if (!smsSent) {
                throw new Exception("Failed to send SMS verification code");
            }
        } else {
            emailService.sendPasswordResetEmail(user, code);
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
    }

    private String generateVerificationCode() {
        Random rnd = new Random();
        int number = rnd.nextInt(1_000_000);
        return String.format("%06d", number);
    }
}
