package com.autorescue.repository;

import com.autorescue.entity.Booking;
import com.autorescue.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingCode(String bookingCode);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByAssignedProviderIdOrderByCreatedAtDesc(Long providerProfileId);
    List<Booking> findByStatusInOrderByCreatedAtDesc(List<BookingStatus> statuses);
    List<Booking> findAllByOrderByCreatedAtDesc();
    long countByStatus(BookingStatus status);
    long countByStatusIn(List<BookingStatus> statuses);
}
