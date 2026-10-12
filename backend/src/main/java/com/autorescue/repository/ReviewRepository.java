package com.autorescue.repository;

import com.autorescue.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBookingId(Long bookingId);
    List<Review> findByProviderProfileIdOrderByCreatedAtDesc(Long providerProfileId);
    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
