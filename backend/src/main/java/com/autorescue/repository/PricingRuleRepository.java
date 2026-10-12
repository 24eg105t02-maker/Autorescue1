package com.autorescue.repository;

import com.autorescue.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    Optional<PricingRule> findByServiceCategoryId(Long serviceCategoryId);
}
