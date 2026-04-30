package com.smartrecipe.service;

import com.smartrecipe.model.Recipe;
import com.smartrecipe.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MealPlanningService {

    @Autowired
    private RecipeRepository recipeRepository;

    private final Map<String, List<PlannedMeal>> lastPlanByUser = new ConcurrentHashMap<>();

    public List<PlannedMeal> generateWeeklyPlan(String username) {
        List<Recipe> allRecipes = recipeRepository.findAll();
        List<Recipe> breakfast = filterByType(allRecipes, Recipe.MealType.BREAKFAST);
        List<Recipe> lunch = filterByType(allRecipes, Recipe.MealType.LUNCH);
        List<Recipe> dinner = filterByType(allRecipes, Recipe.MealType.DINNER);
        List<Recipe> dessert = filterByType(allRecipes, Recipe.MealType.DESSERT);

        List<PlannedMeal> plan = new ArrayList<>();
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        for (int i = 0; i < days.length; i++) {
            addMeal(plan, days[i], "Breakfast", pickFromList(breakfast, i));
            addMeal(plan, days[i], "Lunch", pickFromList(lunch, i + 3));
            addMeal(plan, days[i], "Dinner", pickFromList(dinner, i + 5));
            addMeal(plan, days[i], "Dessert", pickFromList(dessert, i + 7));
        }

        lastPlanByUser.put(normalizeUser(username), plan);
        return plan;
    }

    public List<PlannedMeal> getOrGeneratePlan(String username) {
        String key = normalizeUser(username);
        List<PlannedMeal> existing = lastPlanByUser.get(key);
        if (existing != null && !existing.isEmpty()) {
            return existing;
        }
        return generateWeeklyPlan(username);
    }

    public List<Map<String, Object>> buildShoppingList(String username) {
        List<PlannedMeal> plan = getOrGeneratePlan(username);
        Map<String, Integer> ingredientCounts = new LinkedHashMap<>();

        for (PlannedMeal item : plan) {
            Recipe recipe = item.recipe();
            if (recipe == null || recipe.getIngredients() == null) {
                continue;
            }
            recipe.getIngredients().forEach((ingredient) -> {
                String name = ingredient.getName();
                if (name == null || name.isBlank()) {
                    return;
                }
                String key = name.trim();
                ingredientCounts.put(key, ingredientCounts.getOrDefault(key, 0) + 1);
            });
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : ingredientCounts.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", entry.getKey());
            row.put("quantity", entry.getValue() + "x recipes");
            row.put("purchased", false);
            rows.add(row);
        }
        return rows;
    }

    private List<Recipe> filterByType(List<Recipe> all, Recipe.MealType type) {
        List<Recipe> filtered = all.stream()
            .filter((recipe) -> type.equals(recipe.getMealType()))
            .sorted(Comparator.comparingInt(this::qualityScore).reversed().thenComparing(Recipe::getId))
            .toList();
        if (!filtered.isEmpty()) {
            return filtered;
        }
        return all.stream().sorted(Comparator.comparingInt(this::qualityScore).reversed().thenComparing(Recipe::getId)).toList();
    }

    private Recipe pickFromList(List<Recipe> recipes, int seed) {
        if (recipes == null || recipes.isEmpty()) {
            return null;
        }
        int index = Math.floorMod(seed, recipes.size());
        return recipes.get(index);
    }

    private void addMeal(List<PlannedMeal> plan, String day, String slot, Recipe recipe) {
        if (recipe == null) {
            return;
        }
        plan.add(new PlannedMeal(day, slot, recipe));
    }

    private String normalizeUser(String username) {
        if (username == null || username.isBlank()) {
            return "anonymous";
        }
        return username.trim().toLowerCase(Locale.ROOT);
    }

    private int qualityScore(Recipe recipe) {
        int ingredients = recipe.getIngredients() != null ? recipe.getIngredients().size() : 0;
        int instructions = recipe.getInstructions() != null ? recipe.getInstructions().size() : 0;
        return (ingredients * 2) + instructions;
    }

    public record PlannedMeal(String day, String slot, Recipe recipe) {}
}
