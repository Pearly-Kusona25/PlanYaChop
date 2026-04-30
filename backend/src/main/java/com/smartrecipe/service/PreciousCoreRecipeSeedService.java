package com.smartrecipe.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartrecipe.model.Recipe;
import com.smartrecipe.model.RecipeIngredient;
import com.smartrecipe.model.RecipeInstruction;
import com.smartrecipe.repository.RecipeRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
public class PreciousCoreRecipeSeedService {

    private static final Logger log = LoggerFactory.getLogger(PreciousCoreRecipeSeedService.class);
    private static final String DATASET_PATH = "data/preciouscore_cameroon_100.json";
    private static final int TARGET_COUNT = 100;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostConstruct
    public void seedRecipes() {
        try {
            ClassPathResource resource = new ClassPathResource(DATASET_PATH);
            if (!resource.exists()) {
                log.warn("Recipe seed dataset not found at classpath: {}", DATASET_PATH);
                return;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                List<SeedRecipeRecord> records = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<SeedRecipeRecord>>() {}
                );
                resetPreciousCoreRecipes();
                Map<Recipe.MealType, Integer> mealTypeCounts = new HashMap<>();
                int inserted = 0;
                for (int i = 0; i < records.size() && inserted < TARGET_COUNT; i++) {
                    SeedRecipeRecord record = records.get(i);
                    if (record.title == null || record.title.isBlank()) {
                        continue;
                    }
                    Recipe recipe = toEntity(record, mealTypeCounts, i);
                    recipeRepository.save(recipe);
                    inserted++;
                }
                log.info("PreciousCore seed completed. Inserted {} recipes from dataset size {}.", inserted, records.size());
            }
        } catch (Exception ex) {
            log.error("Failed to seed PreciousCore recipes from {}: {}", DATASET_PATH, ex.getMessage(), ex);
        }
    }

    private void resetPreciousCoreRecipes() {
        List<Recipe> preciousCoreRecipes = recipeRepository.findByTagsContaining("preciouscore");
        if (!preciousCoreRecipes.isEmpty()) {
            recipeRepository.deleteAll(preciousCoreRecipes);
            log.info("Reset {} existing PreciousCore recipes before reseeding.", preciousCoreRecipes.size());
        }
    }

    private Recipe toEntity(SeedRecipeRecord record, Map<Recipe.MealType, Integer> mealTypeCounts, int index) {
        Recipe recipe = new Recipe();
        recipe.setTitle(record.title.trim());
        recipe.setDescription(trimOrNull(record.description));
        recipe.setPrepTime(record.prepTime != null && record.prepTime > 0 ? record.prepTime : 20);
        recipe.setCookTime(record.cookTime != null && record.cookTime > 0 ? record.cookTime : 35);
        recipe.setServings(record.servings != null && record.servings > 0 ? record.servings : 4);
        recipe.setDifficulty(parseDifficulty(record.difficulty));
        recipe.setCuisine(trimOrNull(record.cuisine) != null ? record.cuisine.trim() : "Cameroonian");
        recipe.setImageUrl(defaultImage(record.imageUrl));
        recipe.setMealType(inferMealType(record, recipe.getTitle(), mealTypeCounts, index));

        Set<String> tags = new LinkedHashSet<>();
        if (record.tags != null) {
            for (String tag : record.tags) {
                String cleanTag = trimOrNull(tag);
                if (cleanTag != null) {
                    tags.add(cleanTag);
                }
            }
        }
        if (tags.isEmpty()) {
            tags.add("cameroonian-food");
            tags.add("preciouscore");
        }
        tags.add("preciouscore");
        tags.add("cameroonian-food");
        recipe.setTags(tags);

        Set<RecipeIngredient> ingredientEntities = new LinkedHashSet<>();
        if (record.ingredients != null) {
            for (SeedIngredient item : record.ingredients) {
                String ingredientName = trimOrNull(item != null ? item.name : null);
                if (ingredientName == null) {
                    continue;
                }
                RecipeIngredient ingredient = new RecipeIngredient();
                ingredient.setName(truncate(ingredientName, 240));
                ingredient.setQuantity(truncate(trimOrNull(item.quantity) != null ? item.quantity.trim() : "1", 120));
                ingredient.setUnit(truncate(trimOrNull(item.unit) != null ? item.unit.trim() : "portion", 120));
                ingredient.setNotes(trimOrNull(item.notes));
                ingredient.setRecipe(recipe);
                ingredientEntities.add(ingredient);
            }
        }
        if (ingredientEntities.isEmpty()) {
            RecipeIngredient fallbackIngredient = new RecipeIngredient();
            fallbackIngredient.setName("Ingredients for " + recipe.getTitle());
            fallbackIngredient.setQuantity("1");
            fallbackIngredient.setUnit("portion");
            fallbackIngredient.setRecipe(recipe);
            ingredientEntities.add(fallbackIngredient);
        }
        recipe.setIngredients(ingredientEntities);

        Set<RecipeInstruction> instructionEntities = new LinkedHashSet<>();
        if (record.instructions != null) {
            int step = 1;
            for (SeedInstruction item : record.instructions) {
                String description = trimOrNull(item != null ? item.description : null);
                if (description == null) {
                    continue;
                }
                RecipeInstruction instruction = new RecipeInstruction();
                instruction.setStep(item.step != null && item.step > 0 ? item.step : step);
                instruction.setDescription(description);
                instruction.setDuration(item.duration);
                instruction.setRecipe(recipe);
                instructionEntities.add(instruction);
                step++;
            }
        }
        if (instructionEntities.isEmpty()) {
            RecipeInstruction fallbackInstruction = new RecipeInstruction();
            fallbackInstruction.setStep(1);
            fallbackInstruction.setDescription(buildFallbackInstruction(record));
            fallbackInstruction.setRecipe(recipe);
            instructionEntities.add(fallbackInstruction);
        }
        recipe.setInstructions(instructionEntities);

        return recipe;
    }

    private String defaultImage(String imageUrl) {
        String value = trimOrNull(imageUrl);
        return value != null ? value : "/images/recipe-placeholder.png";
    }

    private String buildFallbackInstruction(SeedRecipeRecord record) {
        String description = trimOrNull(record.description);
        if (description != null) {
            return "Prepare following source guidance: " + description;
        }
        return "Prepare this meal following the source recipe guidance.";
    }

    private Recipe.MealType inferMealType(SeedRecipeRecord record,
                                          String title,
                                          Map<Recipe.MealType, Integer> mealTypeCounts,
                                          int index) {
        String lower = (title + " " + (record.description != null ? record.description : "")).toLowerCase(Locale.ROOT);
        if (containsAny(lower, "cake", "cookie", "ice cream", "pudding", "dessert", "donut", "doughnut", "chin chin", "beignet")) {
            return incrementType(mealTypeCounts, Recipe.MealType.DESSERT);
        }
        if (containsAny(lower, "breakfast", "pancake", "omelette", "toast", "frittata", "waffle", "muffin", "bread", "sandwich")) {
            return incrementType(mealTypeCounts, Recipe.MealType.BREAKFAST);
        }
        if (containsAny(lower, "salad", "wrap", "sandwich", "lunch")) {
            return incrementType(mealTypeCounts, Recipe.MealType.LUNCH);
        }
        if (containsAny(lower, "stew", "soup", "rice", "chicken", "fish", "beef", "pork", "dinner")) {
            return incrementType(mealTypeCounts, Recipe.MealType.DINNER);
        }

        Recipe.MealType fallback = (index % 2 == 0) ? Recipe.MealType.LUNCH : Recipe.MealType.DINNER;
        return incrementType(mealTypeCounts, fallback);
    }

    private Recipe.MealType incrementType(Map<Recipe.MealType, Integer> counts, Recipe.MealType type) {
        counts.put(type, counts.getOrDefault(type, 0) + 1);
        return type;
    }

    private boolean containsAny(String text, String... words) {
        for (String word : words) {
            if (text.contains(word)) {
                return true;
            }
        }
        return false;
    }

    private Recipe.Difficulty parseDifficulty(String difficulty) {
        if (difficulty == null || difficulty.isBlank()) {
            return Recipe.Difficulty.MEDIUM;
        }
        try {
            return Recipe.Difficulty.valueOf(difficulty.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return Recipe.Difficulty.MEDIUM;
        }
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private static class SeedRecipeRecord {
        public String title;
        public String description;
        public String imageUrl;
        public Integer prepTime;
        public Integer cookTime;
        public Integer servings;
        public String difficulty;
        public String cuisine;
        public List<String> tags = new ArrayList<>();
        public List<SeedIngredient> ingredients = new ArrayList<>();
        public List<SeedInstruction> instructions = new ArrayList<>();
    }

    private static class SeedIngredient {
        public String name;
        public String quantity;
        public String unit;
        public String notes;
    }

    private static class SeedInstruction {
        public Integer step;
        public String description;
        public Integer duration;
    }
}
