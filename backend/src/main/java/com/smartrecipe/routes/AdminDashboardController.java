package com.smartrecipe.routes;

import com.smartrecipe.model.Recipe;
import com.smartrecipe.model.SystemActivityLog;
import com.smartrecipe.model.User;
import com.smartrecipe.repository.FavoriteRecipeRepository;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import com.smartrecipe.service.SystemActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private FavoriteRecipeRepository favoriteRecipeRepository;

    @Autowired
    private SystemActivityService systemActivityService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> overview() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("totalUsers", userRepository.count());
        payload.put("totalRecipes", recipeRepository.count());
        payload.put("mealPlans", systemActivityService.countActionSince("MEAL_PLAN_REQUEST", LocalDateTime.MIN));
        payload.put("systemHealth", "Good");
        payload.put("popularRecipes", popularRecipes());
        payload.put("recentActivity", recentActivity(10));
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> logs(
        @RequestParam(name = "limit", defaultValue = "50") int limit
    ) {
        List<Map<String, Object>> data = systemActivityService.recent(limit).stream()
            .map(this::logToMap)
            .toList();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/meal-plan-usage")
    public ResponseEntity<List<Map<String, Object>>> mealPlanUsage() {
        Map<String, Long> byDay = new TreeMap<>();
        for (SystemActivityLog log : systemActivityService.recent(1000)) {
            if (!"MEAL_PLAN_REQUEST".equalsIgnoreCase(log.getAction()) || log.getCreatedAt() == null) {
                continue;
            }
            String day = log.getCreatedAt().toLocalDate().toString();
            byDay.put(day, byDay.getOrDefault(day, 0L) + 1L);
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, Long> entry : byDay.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("day", entry.getKey());
            row.put("requests", entry.getValue());
            rows.add(row);
        }
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/moderation")
    public ResponseEntity<List<Map<String, Object>>> moderationQueue() {
        List<Map<String, Object>> rows = systemActivityService.recent(500).stream()
            .filter((log) -> {
                String action = log.getAction() != null ? log.getAction().toUpperCase(Locale.ROOT) : "";
                return action.contains("COMMENT") || action.contains("RATING") || action.contains("FLAG");
            })
            .map(this::logToMap)
            .toList();
        return ResponseEntity.ok(rows);
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> users(
        @RequestParam(name = "limit", defaultValue = "50") int limit
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        List<Map<String, Object>> data = userRepository
            .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "id")))
            .getContent()
            .stream()
            .map(this::userToMap)
            .toList();
        return ResponseEntity.ok(data);
    }

    @PatchMapping("/users/{id}/enabled")
    public ResponseEntity<Map<String, Object>> updateUserEnabled(
        @PathVariable Long id,
        @RequestBody Map<String, Object> payload,
        Authentication authentication
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Object enabledRaw = payload.get("enabled");
        if (!(enabledRaw instanceof Boolean enabled)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "enabled must be true or false");
        }

        user.setEnabled(enabled);
        userRepository.save(user);
        systemActivityService.warn(
            "ADMIN",
            "ADMIN_USER_STATUS_CHANGED",
            resolveUsername(authentication),
            "Set user " + user.getUsername() + " enabled=" + enabled
        );
        return ResponseEntity.ok(userToMap(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id, Authentication authentication) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String actor = resolveUsername(authentication);

        if (user.getUsername() != null && user.getUsername().equalsIgnoreCase(actor)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own admin account.");
        }
        if ("ADMIN".equalsIgnoreCase(user.getRole()) && userRepository.findAll().stream().filter(u -> "ADMIN".equalsIgnoreCase(u.getRole())).count() <= 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete the last admin account.");
        }

        String username = user.getUsername();
        userRepository.delete(user);
        systemActivityService.warn(
            "ADMIN",
            "ADMIN_USER_DELETED",
            actor,
            "Deleted user account: " + username
        );
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    private List<Map<String, Object>> popularRecipes() {
        Map<Long, Long> favoriteCounts = new HashMap<>();
        for (Object[] row : favoriteRecipeRepository.countFavoritesGroupedByRecipe()) {
            if (row.length < 2 || row[0] == null || row[1] == null) {
                continue;
            }
            Long recipeId = ((Number) row[0]).longValue();
            Long saves = ((Number) row[1]).longValue();
            favoriteCounts.put(recipeId, saves);
        }

        Map<Long, Recipe> byId = new HashMap<>();
        for (Recipe recipe : recipeRepository.findAll()) {
            byId.put(recipe.getId(), recipe);
        }

        List<Map<String, Object>> popular = new ArrayList<>();
        for (Recipe recipe : byId.values()) {
            long views = recipe.getViewCount() != null ? recipe.getViewCount() : 0L;
            long saves = favoriteCounts.getOrDefault(recipe.getId(), 0L);
            if (views <= 0 && saves <= 0) {
                continue;
            }
            long score = (saves * 3) + views;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", recipe.getId());
            row.put("title", recipe.getTitle());
            row.put("views", views);
            row.put("saves", saves);
            row.put("score", score);
            popular.add(row);
        }

        popular.sort((a, b) -> Long.compare((Long) b.get("score"), (Long) a.get("score")));
        if (popular.size() > 10) {
            return popular.subList(0, 10);
        }
        return popular;
    }

    private List<Map<String, Object>> recentActivity(int limit) {
        return systemActivityService.recentByCategory("USER_ACTIVITY", limit).stream()
            .map(this::logToMap)
            .toList();
    }

    private Map<String, Object> logToMap(SystemActivityLog log) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", log.getId());
        row.put("level", log.getLevel());
        row.put("category", log.getCategory());
        row.put("action", log.getAction());
        row.put("username", log.getUsername());
        row.put("message", log.getMessage());
        row.put("createdAt", log.getCreatedAt());
        return row;
    }

    private Map<String, Object> userToMap(User user) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", user.getId());
        row.put("username", user.getUsername());
        row.put("email", user.getEmail());
        row.put("firstName", user.getFirstName());
        row.put("lastName", user.getLastName());
        row.put("role", user.getRole());
        row.put("enabled", user.isEnabled());
        row.put("createdAt", user.getCreatedAt());
        return row;
    }

    private String resolveUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "admin";
        }
        return authentication.getName();
    }
}
