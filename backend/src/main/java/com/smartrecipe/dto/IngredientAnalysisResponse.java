package com.smartrecipe.dto;

import java.util.List;

public class IngredientAnalysisResponse {
    private List<IngredientInfo> ingredients;
    private List<String> suggestions;
    private NutritionalInfo nutritionalInfo;

    public IngredientAnalysisResponse() {}

    public IngredientAnalysisResponse(List<IngredientInfo> ingredients, List<String> suggestions, NutritionalInfo nutritionalInfo) {
        this.ingredients = ingredients;
        this.suggestions = suggestions;
        this.nutritionalInfo = nutritionalInfo;
    }

    // Getters and Setters
    public List<IngredientInfo> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<IngredientInfo> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public NutritionalInfo getNutritionalInfo() {
        return nutritionalInfo;
    }

    public void setNutritionalInfo(NutritionalInfo nutritionalInfo) {
        this.nutritionalInfo = nutritionalInfo;
    }

    public static class IngredientInfo {
        private String name;
        private String category;
        private String seasonality;
        private List<String> substitutes;

        public IngredientInfo() {}

        public IngredientInfo(String name, String category) {
            this.name = name;
            this.category = category;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getSeasonality() { return seasonality; }
        public void setSeasonality(String seasonality) { this.seasonality = seasonality; }
        public List<String> getSubstitutes() { return substitutes; }
        public void setSubstitutes(List<String> substitutes) { this.substitutes = substitutes; }
    }

    public static class NutritionalInfo {
        private int calories;
        private double protein;
        private double carbs;
        private double fat;
        private double fiber;

        public NutritionalInfo() {}

        // Getters and Setters
        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }
        public double getProtein() { return protein; }
        public void setProtein(double protein) { this.protein = protein; }
        public double getCarbs() { return carbs; }
        public void setCarbs(double carbs) { this.carbs = carbs; }
        public double getFat() { return fat; }
        public void setFat(double fat) { this.fat = fat; }
        public double getFiber() { return fiber; }
        public void setFiber(double fiber) { this.fiber = fiber; }
    }
}
