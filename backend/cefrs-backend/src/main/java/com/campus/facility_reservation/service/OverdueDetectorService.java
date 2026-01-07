package com.campus.facility_reservation.service;

import com.campus.facility_reservation.model.EquipmentBorrowing;
import com.campus.facility_reservation.model.FacilityReservation;
import com.campus.facility_reservation.model.User;
import com.campus.facility_reservation.repository.EquipmentBorrowingRepository;
import com.campus.facility_reservation.repository.FacilityReservationRepository;
import com.campus.facility_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OverdueDetectorService {

    private final FacilityReservationRepository facilityReservationRepository;
    private final EquipmentBorrowingRepository equipmentBorrowingRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // Run every hour by default, configurable with property `app.overdue.check-ms`
    @Scheduled(fixedRateString = "${app.overdue.check-ms:3600000}")
    @Transactional
    public void checkOverdueItems() {
        log.debug("Running overdue detector job");

        // 1) Equipment overdue handling
        try {
            List<EquipmentBorrowing> overdueBorrowings = equipmentBorrowingRepository.findOverdueBorrowings(LocalDate.now());
            for (EquipmentBorrowing eb : overdueBorrowings) {
                try {
                    eb.setStatus(EquipmentBorrowing.BorrowingStatus.OVERDUE);
                    equipmentBorrowingRepository.save(eb);

                    User admin = eb.getApprovedBy();
                    if (admin != null && admin.getEmail() != null) {
                        try {
                            emailService.sendEquipmentOverdueAlert(admin, eb);
                        } catch (Exception ex) {
                            log.error("Failed to notify admin for borrowing {}: {}", eb.getId(), ex.getMessage());
                        }
                    } else {
                        List<User> admins = userRepository.findByRole_Name("ADMINISTRATOR");
                        admins.forEach(a -> {
                            try {
                                emailService.sendEquipmentOverdueAlert(a, eb);
                            } catch (Exception ex) {
                                log.error("Failed to notify admin {} for borrowing {}: {}", a.getEmail(), eb.getId(), ex.getMessage());
                            }
                        });
                    }
                    // notify requester (sent once regardless of admin notification path)
                    try {
                        emailService.sendEquipmentOverdueToRequester(eb.getUser(), eb);
                    } catch (Exception ex) {
                        log.error("Failed to notify requester for borrowing {}: {}", eb.getId(), ex.getMessage());
                    }

                    notificationService.createBorrowingStatusNotification(eb.getUser(), eb);
                    log.info("Marked borrowing {} as OVERDUE and notified admin(s)", eb.getId());
                } catch (Exception e) {
                    log.error("Error handling overdue borrowing id={}: {}", eb.getId(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to query overdue borrowings: {}", e.getMessage());
        }

        // 2) Facility reservation end-of-duration handling (mark returned and notify admin)
        try {
            List<FacilityReservation> approved = facilityReservationRepository.findByStatusOrderByReservationDateAscStartTimeAsc(FacilityReservation.ReservationStatus.APPROVED);
            LocalDateTime now = LocalDateTime.now();
            for (FacilityReservation fr : approved) {
                LocalDateTime endDateTime = LocalDateTime.of(fr.getReservationDate(), fr.getEndTime());
                if (endDateTime.isBefore(now)) {
                    try {
                        // mark reservation as OVERDUE if it's past end time and still approved
                        fr.setStatus(FacilityReservation.ReservationStatus.OVERDUE);
                        facilityReservationRepository.save(fr);

                        User admin = fr.getApprovedBy();
                        if (admin != null && admin.getEmail() != null) {
                            try {
                                emailService.sendFacilityOverdueAlert(admin, fr);
                            } catch (Exception ex) {
                                log.error("Failed to notify admin for reservation {}: {}", fr.getId(), ex.getMessage());
                            }
                        } else {
                            List<User> admins = userRepository.findByRole_Name("ADMINISTRATOR");
                            admins.forEach(a -> {
                                try {
                                    emailService.sendFacilityOverdueAlert(a, fr);
                                } catch (Exception ex) {
                                    log.error("Failed to notify admin {} for reservation {}: {}", a.getEmail(), fr.getId(), ex.getMessage());
                                }
                            });
                        }
                        // notify requester once
                        try {
                            emailService.sendFacilityOverdueToRequester(fr.getUser(), fr);
                        } catch (Exception ex) {
                            log.error("Failed to notify requester for reservation {}: {}", fr.getId(), ex.getMessage());
                        }

                        notificationService.createReservationStatusNotification(fr.getUser(), fr);
                        log.info("Marked reservation {} as OVERDUE and notified admin(s)", fr.getId());
                    } catch (Exception e) {
                        log.error("Error handling returned reservation id={}: {}", fr.getId(), e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to query approved reservations: {}", e.getMessage());
        }
    }
}
