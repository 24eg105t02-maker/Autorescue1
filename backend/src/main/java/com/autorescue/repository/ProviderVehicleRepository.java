package com.autorescue.repository;

import com.autorescue.entity.ProviderVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderVehicleRepository extends JpaRepository<ProviderVehicle, Long> {
    List<ProviderVehicle> findByProviderProfileIdOrderByCreatedAtDesc(Long providerProfileId);
}
