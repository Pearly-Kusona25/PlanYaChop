package com.smartrecipe.routes;

import com.smartrecipe.dto.RecipeRequest;
import com.smartrecipe.dto.RecipeResponse;
import com.smartrecipe.model.Recipe;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Recipe API is running");
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecipeResponse> generateRecipe(@RequestBody RecipeRequest request) {
        // Placeholder generation until AI integration is wired.
        RecipeResponse response = new RecipeResponse();
        response.setTitle("Sample Recipe");
        response.setIngredients(Collections.emptyList());
        response.setInstructions(Collections.emptyList());
        response.setPrepTime(10);
        response.setCookTime(20);
        response.setServings(4);
        response.setDifficulty("easy");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RecipeResponse>> getRecentRecipes() {
        List<RecipeResponse> recent = recipeRepository.findTop5ByOrderByIdDesc()
                .stream()
                .map(this::toRecipeResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recent);
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("totalRecipes", recipeRepository.count());
        payload.put("totalUsers", userRepository.count());
        List<RecipeResponse> recent = recipeRepository.findTop5ByOrderByIdDesc()
            .stream()
            .map(this::toRecipeResponse)
            .collect(Collectors.toList());

        payload.put("recentRecipes", recent);
        payload.put("recommendedRecipes", recent);
        payload.put("weeklyPlanner", samplePlanner());
        payload.put("shoppingList", sampleShoppingList());
        payload.put("favorites", sampleFavorites());
        return ResponseEntity.ok(payload);
    }

    private RecipeResponse toRecipeResponse(Recipe recipe) {
        RecipeResponse response = new RecipeResponse();
        response.setTitle(recipe.getTitle());
        response.setPrepTime(recipe.getPrepTime() != null ? recipe.getPrepTime() : 0);
        response.setCookTime(recipe.getCookTime() != null ? recipe.getCookTime() : 0);
        response.setServings(recipe.getServings() != null ? recipe.getServings() : 0);
        response.setDifficulty(recipe.getDifficulty() != null ? recipe.getDifficulty().name().toLowerCase() : null);
        response.setCuisine(recipe.getCuisine());
        response.setTags(new ArrayList<>(recipe.getTags()));
        response.setImageUrl(recipe.getImageUrl());
        response.setIngredients(Collections.emptyList());
        response.setInstructions(Collections.emptyList());

        return response;
    }

    private List<Map<String, String>> samplePlanner() {
        List<Map<String, String>> planner = new ArrayList<>();
        planner.add(Map.of("day", "Mon", "meal", "Grain bowl"));
        planner.add(Map.of("day", "Tue", "meal", "Veggie tacos"));
        planner.add(Map.of("day", "Wed", "meal", "Chicken tray bake"));
        planner.add(Map.of("day", "Thu", "meal", "Pasta primavera"));
        planner.add(Map.of("day", "Fri", "meal", "Salmon & greens"));
        return planner;
    }

    private List<Map<String, Object>> sampleShoppingList() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(item("Spinach", "2 bags"));
        list.add(item("Chicken thighs", "4 pcs"));
        list.add(item("Cherry tomatoes", "1 box"));
        list.add(item("Feta", "200g"));
        return list;
    }

    private Map<String, Object> item(String name, String qty) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("quantity", qty);
        map.put("purchased", false);
        return map;
    }

    private List<String> sampleFavorites() {
        List<String> favs = new ArrayList<>();
        favs.add("Tahini Bowl");
        favs.add("Veggie Tacos");
        favs.add("Sheet Pan Salmon");
        return favs;
    }
}
