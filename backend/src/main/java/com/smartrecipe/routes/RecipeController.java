package com.smartrecipe.routes;

import com.smartrecipe.dto.RecipeRequest;
import com.smartrecipe.dto.RecipeResponse;
import com.smartrecipe.model.Recipe;
import com.smartrecipe.model.RecipeIngredient;
import com.smartrecipe.model.RecipeInstruction;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import com.smartrecipe.service.MealPlanningService;
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

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
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

    @Autowired
    private SystemActivityService systemActivityService;

    @Autowired
    private MealPlanningService mealPlanningService;

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
                .map(this::toRecipeSummaryResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(recent);
    }

    @GetMapping("/home")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<RecipeResponse>> getHomeRecipes(
        @RequestParam(name = "limit", defaultValue = "100") int limit,
        Authentication authentication
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        List<RecipeResponse> recipes = recipeRepository
            .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "id")))
            .getContent()
            .stream()
            .map(this::toRecipeSummaryResponse)
            .collect(Collectors.toList());
        systemActivityService.info(
            "USER_ACTIVITY",
            "HOME_FEED_REQUEST",
            resolveUsername(authentication),
            "Requested home recipe feed (limit=" + safeLimit + ")"
        );
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<RecipeResponse> getRecipeById(@PathVariable Long id, Authentication authentication) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        Long currentViews = recipe.getViewCount() != null ? recipe.getViewCount() : 0L;
        recipe.setViewCount(currentViews + 1);
        recipeRepository.save(recipe);
        systemActivityService.info(
            "USER_ACTIVITY",
            "RECIPE_VIEW",
            resolveUsername(authentication),
            "Viewed recipe: " + recipe.getTitle()
        );
        return ResponseEntity.ok(toRecipeDetailResponse(recipe));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardData(Authentication authentication) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("totalRecipes", recipeRepository.count());
        payload.put("totalUsers", userRepository.count());
        List<RecipeResponse> recent = recipeRepository.findTop5ByOrderByIdDesc()
            .stream()
            .map(this::toRecipeSummaryResponse)
            .collect(Collectors.toList());

        payload.put("recentRecipes", recent);
        payload.put("recommendedRecipes", recent);
        payload.put("weeklyPlanner", mealPlanningService.generateWeeklyPlan(resolveUsername(authentication)).stream().map((entry) -> {
            Map<String, String> row = new LinkedHashMap<>();
            row.put("day", entry.day());
            row.put("meal", entry.slot() + ": " + entry.recipe().getTitle());
            return row;
        }).toList());
        payload.put("shoppingList", mealPlanningService.buildShoppingList(resolveUsername(authentication)));
        payload.put("favorites", sampleFavorites());
        systemActivityService.info(
            "USER_ACTIVITY",
            "DASHBOARD_DATA_REQUEST",
            resolveUsername(authentication),
            "Loaded dashboard data"
        );
        return ResponseEntity.ok(payload);
    }

    @PostMapping("/meal-plan/request")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<Map<String, String>>> requestMealPlan(Authentication authentication) {
        List<Map<String, String>> planner = mealPlanningService.generateWeeklyPlan(resolveUsername(authentication))
            .stream()
            .map((entry) -> {
                Map<String, String> row = new LinkedHashMap<>();
                row.put("day", entry.day());
                row.put("meal", entry.slot() + ": " + entry.recipe().getTitle());
                return row;
            })
            .toList();
        systemActivityService.info(
            "USER_ACTIVITY",
            "MEAL_PLAN_REQUEST",
            resolveUsername(authentication),
            "Requested meal plan"
        );
        return ResponseEntity.ok(planner);
    }

    @PostMapping("/shopping-list/request")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> requestShoppingList(Authentication authentication) {
        List<Map<String, Object>> list = mealPlanningService.buildShoppingList(resolveUsername(authentication));
        systemActivityService.info(
            "USER_ACTIVITY",
            "SHOPPING_LIST_REQUEST",
            resolveUsername(authentication),
            "Requested shopping list"
        );
        return ResponseEntity.ok(list);
    }

    private RecipeResponse toRecipeSummaryResponse(Recipe recipe) {
        RecipeResponse response = new RecipeResponse();
        response.setId(recipe.getId());
        response.setTitle(recipe.getTitle());
        response.setDescription(recipe.getDescription());
        response.setPrepTime(recipe.getPrepTime() != null ? recipe.getPrepTime() : 0);
        response.setCookTime(recipe.getCookTime() != null ? recipe.getCookTime() : 0);
        response.setServings(recipe.getServings() != null ? recipe.getServings() : 0);
        response.setDifficulty(recipe.getDifficulty() != null ? recipe.getDifficulty().name().toLowerCase() : null);
        response.setMealType(recipe.getMealType() != null ? recipe.getMealType().name() : null);
        response.setCuisine(recipe.getCuisine());
        response.setTags(new ArrayList<>(recipe.getTags()));
        response.setImageUrl(recipe.getImageUrl());
        response.setViews(recipe.getViewCount() != null ? recipe.getViewCount() : 0L);
        response.setIngredients(Collections.emptyList());
        response.setInstructions(Collections.emptyList());

        return response;
    }

    private RecipeResponse toRecipeDetailResponse(Recipe recipe) {
        RecipeResponse response = toRecipeSummaryResponse(recipe);
        List<RecipeResponse.Ingredient> ingredients = recipe.getIngredients()
            .stream()
            .sorted(Comparator.comparing(RecipeIngredient::getId, Comparator.nullsLast(Long::compareTo)))
            .map((ingredient) -> {
                RecipeResponse.Ingredient item = new RecipeResponse.Ingredient();
                item.setName(ingredient.getName());
                item.setQuantity(ingredient.getQuantity());
                item.setUnit(ingredient.getUnit());
                item.setNotes(ingredient.getNotes());
                return item;
            })
            .collect(Collectors.toList());
        response.setIngredients(ingredients);

        List<RecipeResponse.Instruction> instructions = recipe.getInstructions()
            .stream()
            .sorted(Comparator.comparing(RecipeInstruction::getStep, Comparator.nullsLast(Integer::compareTo)))
            .map((instruction) -> {
                RecipeResponse.Instruction item = new RecipeResponse.Instruction();
                item.setStep(instruction.getStep() != null ? instruction.getStep() : 0);
                item.setDescription(instruction.getDescription());
                item.setDuration(instruction.getDuration());
                return item;
            })
            .collect(Collectors.toList());
        response.setInstructions(instructions);
        return response;
    }

    private List<String> sampleFavorites() {
        List<String> favs = new ArrayList<>();
        favs.add("Tahini Bowl");
        favs.add("Veggie Tacos");
        favs.add("Sheet Pan Salmon");
        return favs;
    }

    private String resolveUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "anonymous";
        }
        return authentication.getName();
    }
}
