package com.autorescue.service;

import com.autorescue.dto.AdminDtos;
import com.autorescue.dto.AuthDtos;
import com.autorescue.dto.PaymentReviewDtos;
import com.autorescue.entity.AuditLog;
import com.autorescue.entity.Notification;
import com.autorescue.entity.User;
import com.autorescue.exception.ResourceNotFoundException;
import com.autorescue.repository.AuditLogRepository;
import com.autorescue.repository.NotificationRepository;
import com.autorescue.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationAuditService {

    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public NotificationAuditService(
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type, String referenceId) {
        if (user == null) return;
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        n.setRead(false);
        notificationRepository.save(n);
    }

    @Transactional
    public void logAction(String actorEmail, String actorRole, String action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog();
        log.setActorEmail(actorEmail != null ? actorEmail : "SYSTEM");
        log.setActorRole(actorRole != null ? actorRole : "SYSTEM");
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<PaymentReviewDtos.NotificationDto> getUserNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toNotificationDto)
                .toList();
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = getUserByEmail(email);
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : list) {
            n.setRead(true);
        }
        notificationRepository.saveAll(list);
    }

    @Transactional
    public void markRead(String email, Long notificationId) {
        User user = getUserByEmail(email);
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (n.getUser().getId().equals(user.getId())) {
            n.setRead(true);
            notificationRepository.save(n);
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public AuthDtos.UserSummaryDto toUserSummary(User user) {
        AuthDtos.UserSummaryDto dto = new AuthDtos.UserSummaryDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole().name());
        dto.setActive(user.isActive());
        dto.setAddress(user.getAddress());
        dto.setDefaultVehicleMake(user.getDefaultVehicleMake());
        dto.setDefaultVehicleModel(user.getDefaultVehicleModel());
        dto.setDefaultVehicleRegistration(user.getDefaultVehicleRegistration());
        dto.setDefaultVehicleType(user.getDefaultVehicleType());
        dto.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return dto;
    }

    public PaymentReviewDtos.NotificationDto toNotificationDto(Notification n) {
        PaymentReviewDtos.NotificationDto dto = new PaymentReviewDtos.NotificationDto();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setReferenceId(n.getReferenceId());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null);
        return dto;
    }

    public AdminDtos.AuditLogDto toAuditLogDto(AuditLog log) {
        AdminDtos.AuditLogDto dto = new AdminDtos.AuditLogDto();
        dto.setId(log.getId());
        dto.setActorEmail(log.getActorEmail());
        dto.setActorRole(log.getActorRole());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setDetails(log.getDetails());
        dto.setCreatedAt(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null);
        return dto;
    }
}
