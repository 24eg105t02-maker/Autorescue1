package com.autorescue.repository;

import com.autorescue.entity.ProviderBid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderBidRepository extends JpaRepository<ProviderBid, Long> {
    List<ProviderBid> findByBookingIdOrderByCreatedAtDesc(Long bookingId);
    List<ProviderBid> findByProviderProfileIdOrderByCreatedAtDesc(Long providerProfileId);
}
