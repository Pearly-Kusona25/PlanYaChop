package com.smartrecipe.dto;

import java.util.List;

public class MealPlanResponse {
    private List<MealDay> days;
    private List<String> shoppingList;
    private double estimatedCost;

    public MealPlanResponse() {}

    public MealPlanResponse(List<MealDay> days, List<String> shoppingList, double estimatedCost) {
        this.days = days;
        this.shoppingList = shoppingList;
        this.estimatedCost = estimatedCost;
    }

    // Getters and Setters
    public List<MealDay> getDays() {
        return days;
    }

    public void setDays(List<MealDay> days) {
        this.days = days;
    }

    public List<String> getShoppingList() {
        return shoppingList;
    }

    public void setShoppingList(List<String> shoppingList) {
        this.shoppingList = shoppingList;
    }

    public double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public static class MealDay {
        private String day;
        private List<Meal> meals;

        public MealDay() {}

        public MealDay(String day, List<Meal> meals) {
            this.day = day;
            this.meals = meals;
        }

        // Getters and Setters
        public String getDay() { return day; }
        public void setDay(String day) { this.day = day; }
        public List<Meal> getMeals() { return meals; }
        public void setMeals(List<Meal> meals) { this.meals = meals; }
    }

    public static class Meal {
        private String type; // breakfast, lunch, dinner, snack
        private RecipeResponse recipe;

        public Meal() {}

        public Meal(String type, RecipeResponse recipe) {
            this.type = type;
            this.recipe = recipe;
        }

        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public RecipeResponse getRecipe() { return recipe; }
        public void setRecipe(RecipeResponse recipe) { this.recipe = recipe; }
    }
}
