package com.smartrecipe.routes;

import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> overview() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("totalUsers", userRepository.count());
        payload.put("totalRecipes", recipeRepository.count());
        payload.put("mealPlans", Math.max(1, recipeRepository.count() / 2));
        payload.put("systemHealth", "Good");
        payload.put("popularRecipes", samplePopular());
        payload.put("recentActivity", sampleActivity());
        return ResponseEntity.ok(payload);
    }

    private List<Map<String, Object>> samplePopular() {
        return List.of(
            map("Spicy Lentil Bowl", 1200),
            map("Avocado Toast Stack", 980),
            map("Herb Chicken Tray", 740)
        );
    }

    private List<String> sampleActivity() {
        return List.of(
            "user123 created a meal plan",
            "chef_amal edited a recipe",
            "mealbyzoe left a 5★ rating",
            "Flagged comment awaiting review"
        );
    }

    private Map<String, Object> map(String title, int saves) {
        Map<String, Object> m = new HashMap<>();
        m.put("title", title);
        m.put("saves", saves);
        return m;
    }
}
