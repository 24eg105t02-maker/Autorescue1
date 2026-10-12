package com.autorescue.repository;

import com.autorescue.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByBookingId(Long bookingId);
    List<Invoice> findByBookingCustomerIdOrderByIssuedAtDesc(Long customerId);
}
