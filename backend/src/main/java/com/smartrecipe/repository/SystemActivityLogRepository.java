package com.smartrecipe.repository;

import com.smartrecipe.model.SystemActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemActivityLogRepository extends JpaRepository<SystemActivityLog, Long> {

    List<SystemActivityLog> findByOrderByCreatedAtDesc(Pageable pageable);

    List<SystemActivityLog> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);

    long countByActionAndCreatedAtAfter(String action, LocalDateTime createdAt);
}
