package com.autorescue.repository;

import com.autorescue.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    List<Payment> findByBookingCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Payment> findAllByOrderByCreatedAtDesc();
}
