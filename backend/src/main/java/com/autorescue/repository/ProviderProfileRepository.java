package com.autorescue.repository;

import com.autorescue.entity.ProviderProfile;
import com.autorescue.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUserId(Long userId);
    Optional<ProviderProfile> findByLicenseNumber(String licenseNumber);
    List<ProviderProfile> findAllByOrderByCreatedAtDesc();
    List<ProviderProfile> findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus status);
    long countByVerificationStatus(VerificationStatus status);
}
