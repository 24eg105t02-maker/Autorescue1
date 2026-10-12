package com.autorescue.repository;

import com.autorescue.entity.BookingPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingPhotoRepository extends JpaRepository<BookingPhoto, Long> {
    List<BookingPhoto> findByBookingIdOrderByUploadedAtDesc(Long bookingId);
}
