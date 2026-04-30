package com.smartrecipe.service;

import com.smartrecipe.model.SystemActivityLog;
import com.smartrecipe.repository.SystemActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemActivityService {

    @Autowired
    private SystemActivityLogRepository systemActivityLogRepository;

    public void info(String category, String action, String username, String message) {
        save("INFO", category, action, username, message);
    }

    public void warn(String category, String action, String username, String message) {
        save("WARN", category, action, username, message);
    }

    public void error(String category, String action, String username, String message) {
        save("ERROR", category, action, username, message);
    }

    public List<SystemActivityLog> recent(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        return systemActivityLogRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, safeLimit));
    }

    public List<SystemActivityLog> recentByCategory(String category, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        return systemActivityLogRepository.findByCategoryOrderByCreatedAtDesc(category, PageRequest.of(0, safeLimit));
    }

    public long countActionSince(String action, LocalDateTime since) {
        return systemActivityLogRepository.countByActionAndCreatedAtAfter(action, since);
    }

    private void save(String level, String category, String action, String username, String message) {
        String safeCategory = normalize(category, "SYSTEM");
        String safeAction = normalize(action, "EVENT");
        String safeMessage = message == null || message.isBlank()
            ? "No message"
            : message.trim();

        SystemActivityLog entry = new SystemActivityLog();
        entry.setLevel(level);
        entry.setCategory(safeCategory);
        entry.setAction(safeAction);
        entry.setUsername(username != null && !username.isBlank() ? username.trim() : null);
        entry.setMessage(safeMessage.length() > 500 ? safeMessage.substring(0, 500) : safeMessage);
        systemActivityLogRepository.save(entry);
    }

    private String normalize(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String trimmed = value.trim().toUpperCase();
        return trimmed.length() > 64 ? trimmed.substring(0, 64) : trimmed;
    }
}
