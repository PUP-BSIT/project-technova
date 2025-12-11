package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.FacilityReservation;
import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@cefrs.site}")
    private String mailFrom;

    @Value("${app.mail.from-name:CEFRS System}")
    private String mailFromName;

    /**
     * Send approval notification for facility reservation
     */
    @Transactional
    public void sendFacilityApprovalEmail(User user, FacilityReservation reservation, String adminNotes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "Your Facility Reservation Has Been Approved ✓";
            String htmlContent = buildFacilityApprovalHtml(user, reservation, adminNotes);

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Facility approval email sent to {} for reservation {}", user.getEmail(), reservation.getId());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send facility approval email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send rejection notification for facility reservation
     */
    @Transactional
    public void sendFacilityRejectionEmail(User user, FacilityReservation reservation, String adminNotes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "Your Facility Reservation Has Been Declined";
            String htmlContent = buildFacilityRejectionHtml(user, reservation, adminNotes);

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Facility rejection email sent to {} for reservation {}", user.getEmail(), reservation.getId());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send facility rejection email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send approval notification for equipment borrowing
     */
    @Transactional
    public void sendEquipmentApprovalEmail(User user, EquipmentBorrowing borrowing, String adminNotes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "Your Equipment Borrowing Request Has Been Approved ✓";
            String htmlContent = buildEquipmentApprovalHtml(user, borrowing, adminNotes);

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Equipment approval email sent to {} for borrowing {}", user.getEmail(), borrowing.getId());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send equipment approval email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send rejection notification for equipment borrowing
     */
    @Transactional
    public void sendEquipmentRejectionEmail(User user, EquipmentBorrowing borrowing, String adminNotes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String subject = "Your Equipment Borrowing Request Has Been Declined";
            String htmlContent = buildEquipmentRejectionHtml(user, borrowing, adminNotes);

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Equipment rejection email sent to {} for borrowing {}", user.getEmail(), borrowing.getId());
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send equipment rejection email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ==================== HTML Email Templates ====================

    private String buildFacilityApprovalHtml(User user, FacilityReservation reservation, String adminNotes) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        String reservationDateTime = reservation.getReservationDate().format(dateFormatter) + " | " +
                                     reservation.getStartTime().format(timeFormatter) + " - " +
                                     reservation.getEndTime().format(timeFormatter);

        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>Facility Reservation Approved</title>" +
                "    <style>" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; }" +
                "        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }" +
                "        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; }" +
                "        .header h1 { font-size: 28px; margin-bottom: 10px; }" +
                "        .header p { font-size: 14px; opacity: 0.9; }" +
                "        .content { padding: 30px; }" +
                "        .greeting { font-size: 16px; margin-bottom: 20px; color: #333; }" +
                "        .details { background-color: #f9f9f9; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px; }" +
                "        .detail-row { margin: 12px 0; display: flex; justify-content: space-between; }" +
                "        .detail-label { font-weight: 600; color: #555; min-width: 150px; }" +
                "        .detail-value { color: #333; text-align: right; }" +
                "        .admin-notes { background-color: #fafafa; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
                "        .admin-notes-title { font-weight: 600; color: #3b82f6; margin-bottom: 10px; }" +
                "        .admin-notes-content { color: #555; line-height: 1.5; }" +
                "        .action-section { margin: 30px 0; text-align: center; }" +
                "        .btn { display: inline-block; background-color: #22c55e; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 10px; }" +
                "        .btn:hover { background-color: #16a34a; }" +
                "        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }" +
                "        .footer p { margin: 5px 0; }" +
                "        .success-badge { display: inline-block; background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <span class='success-badge'>✓ APPROVED</span>" +
                "            <h1>Reservation Approved!</h1>" +
                "            <p>Your facility reservation request has been successfully approved.</p>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p class='greeting'>Hello " + user.getFirstName() + ",</p>" +
                "            <p>We're pleased to inform you that your facility reservation has been <strong>approved</strong> by the administration.</p>" +
                "            <div class='details'>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Facility Name:</span>" +
                "                    <span class='detail-value'><strong>" + reservation.getFacility().getName() + "</strong></span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Reservation ID:</span>" +
                "                    <span class='detail-value'>#RES" + reservation.getId() + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Date & Time:</span>" +
                "                    <span class='detail-value'>" + reservationDateTime + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Purpose:</span>" +
                "                    <span class='detail-value'>" + (reservation.getPurpose() != null ? reservation.getPurpose() : "N/A") + "</span>" +
                "                </div>" +
                "            </div>" +
                (adminNotes != null && !adminNotes.trim().isEmpty() ?
                "            <div class='admin-notes'>" +
                "                <p class='admin-notes-title'>📝 Admin Notes:</p>" +
                "                <p class='admin-notes-content'>" + adminNotes + "</p>" +
                "            </div>" : "") +
                "            <p style='margin-top: 20px; color: #666;'>" +
                "                Please ensure you arrive on time for your reservation. If you need to make any changes, " +
                "                please contact the administration office as soon as possible." +
                "            </p>" +
                "            <div class='action-section'>" +
                "                <a href='https://cefrs.site/dashboard' class='btn'>View Reservation Details</a>" +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p><strong>Campus Equipment & Facility Reservation System (CEFRS)</strong></p>" +
                "            <p>This is an automated notification. Please do not reply to this email.</p>" +
                "            <p>© 2025 Campus Facilities Department. All rights reserved.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    private String buildFacilityRejectionHtml(User user, FacilityReservation reservation, String adminNotes) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");
        String reservationDateTime = reservation.getReservationDate().format(dateFormatter) + " | " +
                                     reservation.getStartTime().format(timeFormatter) + " - " +
                                     reservation.getEndTime().format(timeFormatter);

        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>Facility Reservation Declined</title>" +
                "    <style>" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; }" +
                "        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }" +
                "        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }" +
                "        .header h1 { font-size: 28px; margin-bottom: 10px; }" +
                "        .header p { font-size: 14px; opacity: 0.9; }" +
                "        .content { padding: 30px; }" +
                "        .greeting { font-size: 16px; margin-bottom: 20px; color: #333; }" +
                "        .details { background-color: #f9f9f9; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }" +
                "        .detail-row { margin: 12px 0; display: flex; justify-content: space-between; }" +
                "        .detail-label { font-weight: 600; color: #555; min-width: 150px; }" +
                "        .detail-value { color: #333; text-align: right; }" +
                "        .admin-notes { background-color: #fafafa; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
                "        .admin-notes-title { font-weight: 600; color: #f97316; margin-bottom: 10px; }" +
                "        .admin-notes-content { color: #555; line-height: 1.5; }" +
                "        .action-section { margin: 30px 0; text-align: center; }" +
                "        .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 10px; }" +
                "        .btn:hover { background-color: #2563eb; }" +
                "        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }" +
                "        .footer p { margin: 5px 0; }" +
                "        .decline-badge { display: inline-block; background-color: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <span class='decline-badge'>✕ DECLINED</span>" +
                "            <h1>Reservation Request Declined</h1>" +
                "            <p>Your facility reservation request has been reviewed and declined.</p>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p class='greeting'>Hello " + user.getFirstName() + ",</p>" +
                "            <p>Unfortunately, your facility reservation request has been <strong>declined</strong> by the administration.</p>" +
                "            <div class='details'>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Facility Name:</span>" +
                "                    <span class='detail-value'><strong>" + reservation.getFacility().getName() + "</strong></span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Reservation ID:</span>" +
                "                    <span class='detail-value'>#RES" + reservation.getId() + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Requested Date & Time:</span>" +
                "                    <span class='detail-value'>" + reservationDateTime + "</span>" +
                "                </div>" +
                "            </div>" +
                (adminNotes != null && !adminNotes.trim().isEmpty() ?
                "            <div class='admin-notes'>" +
                "                <p class='admin-notes-title'>📝 Reason for Decline:</p>" +
                "                <p class='admin-notes-content'>" + adminNotes + "</p>" +
                "            </div>" : "") +
                "            <p style='margin-top: 20px; color: #666;'>" +
                "                If you believe this decision is in error or would like to discuss alternative dates, " +
                "                please contact the administration office." +
                "            </p>" +
                "            <div class='action-section'>" +
                "                <a href='https://cefrs.site/dashboard' class='btn'>Submit New Request</a>" +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p><strong>Campus Equipment & Facility Reservation System (CEFRS)</strong></p>" +
                "            <p>This is an automated notification. Please do not reply to this email.</p>" +
                "            <p>© 2025 Campus Facilities Department. All rights reserved.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    private String buildEquipmentApprovalHtml(User user, EquipmentBorrowing borrowing, String adminNotes) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String borrowDate = borrowing.getBorrowDate().format(formatter);
        // Use the expected return date since the request is still in approval flow
        String returnDate = borrowing.getExpectedReturnDate().format(formatter);

        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>Equipment Borrowing Approved</title>" +
                "    <style>" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; }" +
                "        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }" +
                "        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; }" +
                "        .header h1 { font-size: 28px; margin-bottom: 10px; }" +
                "        .header p { font-size: 14px; opacity: 0.9; }" +
                "        .content { padding: 30px; }" +
                "        .greeting { font-size: 16px; margin-bottom: 20px; color: #333; }" +
                "        .details { background-color: #f9f9f9; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 4px; }" +
                "        .detail-row { margin: 12px 0; display: flex; justify-content: space-between; }" +
                "        .detail-label { font-weight: 600; color: #555; min-width: 150px; }" +
                "        .detail-value { color: #333; text-align: right; }" +
                "        .admin-notes { background-color: #fafafa; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
                "        .admin-notes-title { font-weight: 600; color: #3b82f6; margin-bottom: 10px; }" +
                "        .admin-notes-content { color: #555; line-height: 1.5; }" +
                "        .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
                "        .warning-title { font-weight: 600; color: #d97706; margin-bottom: 10px; }" +
                "        .warning-content { color: #555; line-height: 1.5; font-size: 14px; }" +
                "        .action-section { margin: 30px 0; text-align: center; }" +
                "        .btn { display: inline-block; background-color: #22c55e; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 10px; }" +
                "        .btn:hover { background-color: #16a34a; }" +
                "        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }" +
                "        .footer p { margin: 5px 0; }" +
                "        .success-badge { display: inline-block; background-color: #22c55e; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <span class='success-badge'>✓ APPROVED</span>" +
                "            <h1>Equipment Borrowing Approved!</h1>" +
                "            <p>Your equipment borrowing request has been successfully approved.</p>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p class='greeting'>Hello " + user.getFirstName() + ",</p>" +
                "            <p>We're pleased to inform you that your equipment borrowing request has been <strong>approved</strong> by the administration.</p>" +
                "            <div class='details'>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Equipment Name:</span>" +
                "                    <span class='detail-value'><strong>" + borrowing.getEquipment().getName() + "</strong></span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Borrowing ID:</span>" +
                "                    <span class='detail-value'>#BOR" + borrowing.getId() + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Quantity:</span>" +
                "                    <span class='detail-value'>" + borrowing.getQuantity() + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Borrow Date:</span>" +
                "                    <span class='detail-value'>" + borrowDate + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Return Date:</span>" +
                "                    <span class='detail-value'>" + returnDate + "</span>" +
                "                </div>" +
                "            </div>" +
                (adminNotes != null && !adminNotes.trim().isEmpty() ?
                "            <div class='admin-notes'>" +
                "                <p class='admin-notes-title'>📝 Admin Notes:</p>" +
                "                <p class='admin-notes-content'>" + adminNotes + "</p>" +
                "            </div>" : "") +
                "            <div class='warning'>" +
                "                <p class='warning-title'>⚠️ Important Reminder:</p>" +
                "                <p class='warning-content'>" +
                "                    Please pick up your equipment on or before the borrow date and return it on or before the return date. " +
                "                    Late returns may result in penalties." +
                "                </p>" +
                "            </div>" +
                "            <div class='action-section'>" +
                "                <a href='https://cefrs.site/dashboard' class='btn'>View Borrowing Details</a>" +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p><strong>Campus Equipment & Facility Reservation System (CEFRS)</strong></p>" +
                "            <p>This is an automated notification. Please do not reply to this email.</p>" +
                "            <p>© 2025 Campus Facilities Department. All rights reserved.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    private String buildEquipmentRejectionHtml(User user, EquipmentBorrowing borrowing, String adminNotes) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        String borrowDate = borrowing.getBorrowDate().format(formatter);
        String returnDate = borrowing.getExpectedReturnDate().format(formatter);

        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "    <title>Equipment Borrowing Declined</title>" +
                "    <style>" +
                "        * { margin: 0; padding: 0; box-sizing: border-box; }" +
                "        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6; }" +
                "        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }" +
                "        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }" +
                "        .header h1 { font-size: 28px; margin-bottom: 10px; }" +
                "        .header p { font-size: 14px; opacity: 0.9; }" +
                "        .content { padding: 30px; }" +
                "        .greeting { font-size: 16px; margin-bottom: 20px; color: #333; }" +
                "        .details { background-color: #f9f9f9; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }" +
                "        .detail-row { margin: 12px 0; display: flex; justify-content: space-between; }" +
                "        .detail-label { font-weight: 600; color: #555; min-width: 150px; }" +
                "        .detail-value { color: #333; text-align: right; }" +
                "        .admin-notes { background-color: #fafafa; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
                "        .admin-notes-title { font-weight: 600; color: #f97316; margin-bottom: 10px; }" +
                "        .admin-notes-content { color: #555; line-height: 1.5; }" +
                "        .action-section { margin: 30px 0; text-align: center; }" +
                "        .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 10px; }" +
                "        .btn:hover { background-color: #2563eb; }" +
                "        .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; }" +
                "        .footer p { margin: 5px 0; }" +
                "        .decline-badge { display: inline-block; background-color: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <span class='decline-badge'>✕ DECLINED</span>" +
                "            <h1>Equipment Borrowing Request Declined</h1>" +
                "            <p>Your equipment borrowing request has been reviewed and declined.</p>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <p class='greeting'>Hello " + user.getFirstName() + ",</p>" +
                "            <p>Unfortunately, your equipment borrowing request has been <strong>declined</strong> by the administration.</p>" +
                "            <div class='details'>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Equipment Name:</span>" +
                "                    <span class='detail-value'><strong>" + borrowing.getEquipment().getName() + "</strong></span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Borrowing ID:</span>" +
                "                    <span class='detail-value'>#BOR" + borrowing.getId() + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Requested Quantity:</span>" +
                "                    <span class='detail-value'>" + borrowing.getQuantity() + "</span>" +
                "                </div>" +
                "                <div class='detail-row'>" +
                "                    <span class='detail-label'>Requested Dates:</span>" +
                "                    <span class='detail-value'>" + borrowDate + " - " + returnDate + "</span>" +
                "                </div>" +
                "            </div>" +
                (adminNotes != null && !adminNotes.trim().isEmpty() ?
                "            <div class='admin-notes'>" +
                "                <p class='admin-notes-title'>📝 Reason for Decline:</p>" +
                "                <p class='admin-notes-content'>" + adminNotes + "</p>" +
                "            </div>" : "") +
                "            <p style='margin-top: 20px; color: #666;'>" +
                "                If you would like to discuss this decision or would like to submit a new request with different details, " +
                "                please contact the equipment office." +
                "            </p>" +
                "            <div class='action-section'>" +
                "                <a href='https://cefrs.site/dashboard' class='btn'>Submit New Request</a>" +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p><strong>Campus Equipment & Facility Reservation System (CEFRS)</strong></p>" +
                "            <p>This is an automated notification. Please do not reply to this email.</p>" +
                "            <p>© 2025 Campus Facilities Department. All rights reserved.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}
