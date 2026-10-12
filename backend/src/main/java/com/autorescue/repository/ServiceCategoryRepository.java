package com.autorescue.repository;

import com.autorescue.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    List<ServiceCategory> findByActiveTrueOrderByIdAsc();
    List<ServiceCategory> findAllByOrderByIdAsc();
    Optional<ServiceCategory> findByCode(String code);
}
