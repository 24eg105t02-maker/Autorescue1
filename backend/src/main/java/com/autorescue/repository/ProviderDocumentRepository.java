package com.autorescue.repository;

import com.autorescue.entity.ProviderDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProviderDocumentRepository extends JpaRepository<ProviderDocument, Long> {
    List<ProviderDocument> findByProviderProfileIdOrderByUploadedAtDesc(Long providerProfileId);
}
