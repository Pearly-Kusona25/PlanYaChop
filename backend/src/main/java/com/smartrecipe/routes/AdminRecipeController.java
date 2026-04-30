package com.smartrecipe.routes;

import com.smartrecipe.dto.AdminRecipeCreateRequest;
import com.smartrecipe.model.Recipe;
import com.smartrecipe.model.RecipeIngredient;
import com.smartrecipe.model.RecipeInstruction;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import com.smartrecipe.service.SystemActivityService;
import jakarta.validation.Valid;
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
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/recipes")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminRecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemActivityService systemActivityService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createRecipe(@Valid @RequestBody AdminRecipeCreateRequest request,
                                                            Authentication authentication) {
        Recipe recipe = new Recipe();
        recipe.setTitle(request.getTitle().trim());
        recipe.setDescription(blankToNull(request.getDescription()));
        recipe.setPrepTime(request.getPrepTime());
        recipe.setCookTime(request.getCookTime());
        recipe.setServings(request.getServings());
        recipe.setDifficulty(parseDifficulty(request.getDifficulty()));
        recipe.setMealType(parseMealType(request.getMealType()));
        recipe.setCuisine(blankToNull(request.getCuisine()));
        recipe.setImageUrl(blankToNull(request.getImageUrl()));
        recipe.setTags(normalizeTags(request.getTags()));
        applyLineItems(recipe, request);

        LocalDateTime now = LocalDateTime.now();
        recipe.setCreatedAt(now);
        recipe.setUpdatedAt(now);

        if (authentication != null && authentication.getName() != null) {
            userRepository.findByUsername(authentication.getName()).ifPresent(recipe::setUser);
        }

        Recipe saved = recipeRepository.save(recipe);
        systemActivityService.info(
            "ADMIN",
            "ADMIN_RECIPE_CREATED",
            resolveUsername(authentication),
            "Created recipe: " + saved.getTitle()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toSummary(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRecipe(@PathVariable Long id,
                                                            @Valid @RequestBody AdminRecipeCreateRequest request,
                                                            Authentication authentication) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        recipe.setTitle(request.getTitle().trim());
        recipe.setDescription(blankToNull(request.getDescription()));
        recipe.setPrepTime(request.getPrepTime());
        recipe.setCookTime(request.getCookTime());
        recipe.setServings(request.getServings());
        recipe.setDifficulty(parseDifficulty(request.getDifficulty()));
        recipe.setMealType(parseMealType(request.getMealType()));
        recipe.setCuisine(blankToNull(request.getCuisine()));
        recipe.setImageUrl(blankToNull(request.getImageUrl()));
        recipe.setTags(normalizeTags(request.getTags()));
        applyLineItems(recipe, request);
        recipe.setUpdatedAt(LocalDateTime.now());

        Recipe saved = recipeRepository.save(recipe);
        systemActivityService.info(
            "ADMIN",
            "ADMIN_RECIPE_UPDATED",
            resolveUsername(authentication),
            "Updated recipe: " + saved.getTitle()
        );
        return ResponseEntity.ok(toSummary(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRecipe(@PathVariable Long id, Authentication authentication) {
        Recipe recipe = recipeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));
        String title = recipe.getTitle();
        recipeRepository.delete(recipe);
        systemActivityService.warn(
            "ADMIN",
            "ADMIN_RECIPE_DELETED",
            resolveUsername(authentication),
            "Deleted recipe: " + title
        );
        return ResponseEntity.ok(Map.of("message", "Recipe deleted successfully"));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentRecipes(
        @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        int safeLimit = Math.max(1, Math.min(limit, 50));
        List<Map<String, Object>> rows = recipeRepository
            .findAll(PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "id")))
            .getContent()
            .stream()
            .map(this::toSummary)
            .toList();
        return ResponseEntity.ok(rows);
    }

    private Recipe.Difficulty parseDifficulty(String rawDifficulty) {
        if (rawDifficulty == null || rawDifficulty.isBlank()) {
            return Recipe.Difficulty.EASY;
        }

        try {
            return Recipe.Difficulty.valueOf(rawDifficulty.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Difficulty must be EASY, MEDIUM, or HARD."
            );
        }
    }

    private Set<String> normalizeTags(List<String> tags) {
        Set<String> normalized = new LinkedHashSet<>();
        if (tags == null) {
            return normalized;
        }

        for (String tag : tags) {
            String cleanTag = blankToNull(tag);
            if (cleanTag != null) {
                normalized.add(cleanTag);
            }
        }
        return normalized;
    }

    private Recipe.MealType parseMealType(String rawMealType) {
        if (rawMealType == null || rawMealType.isBlank()) {
            return Recipe.MealType.DINNER;
        }
        try {
            return Recipe.MealType.valueOf(rawMealType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Meal type must be BREAKFAST, LUNCH, DINNER, or DESSERT."
            );
        }
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Map<String, Object> toSummary(Recipe recipe) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", recipe.getId());
        summary.put("title", recipe.getTitle());
        summary.put("description", recipe.getDescription());
        summary.put("prepTime", recipe.getPrepTime());
        summary.put("cookTime", recipe.getCookTime());
        summary.put("servings", recipe.getServings());
        summary.put("difficulty", recipe.getDifficulty() != null ? recipe.getDifficulty().name() : null);
        summary.put("mealType", recipe.getMealType() != null ? recipe.getMealType().name() : null);
        summary.put("cuisine", recipe.getCuisine());
        summary.put("tags", recipe.getTags());
        summary.put("imageUrl", recipe.getImageUrl());
        summary.put("ingredients", recipe.getIngredients().stream().map(RecipeIngredient::getName).toList());
        summary.put("instructions", recipe.getInstructions().stream().map(RecipeInstruction::getDescription).toList());
        summary.put("createdAt", recipe.getCreatedAt());
        summary.put("createdBy", recipe.getUser() != null ? recipe.getUser().getUsername() : null);
        return summary;
    }

    private void applyLineItems(Recipe recipe, AdminRecipeCreateRequest request) {
        Set<RecipeIngredient> ingredients = new LinkedHashSet<>();
        if (request.getIngredientLines() != null) {
            for (String line : request.getIngredientLines()) {
                String ingredientName = blankToNull(line);
                if (ingredientName == null) {
                    continue;
                }
                RecipeIngredient ingredient = new RecipeIngredient();
                ingredient.setName(ingredientName);
                ingredient.setQuantity("1");
                ingredient.setUnit("portion");
                ingredient.setRecipe(recipe);
                ingredients.add(ingredient);
            }
        }
        recipe.setIngredients(ingredients);

        Set<RecipeInstruction> instructions = new LinkedHashSet<>();
        int step = 1;
        if (request.getInstructionLines() != null) {
            for (String line : request.getInstructionLines()) {
                String description = blankToNull(line);
                if (description == null) {
                    continue;
                }
                RecipeInstruction instruction = new RecipeInstruction();
                instruction.setStep(step++);
                instruction.setDescription(description);
                instruction.setRecipe(recipe);
                instructions.add(instruction);
            }
        }
        recipe.setInstructions(instructions);
    }

    private String resolveUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "admin";
        }
        return authentication.getName();
    }
}
