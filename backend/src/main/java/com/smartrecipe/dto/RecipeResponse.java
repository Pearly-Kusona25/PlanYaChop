package com.smartrecipe.dto;

import java.util.List;

public class RecipeResponse {
    private Long id;
    private String title;
    private String description;
    private List<Ingredient> ingredients;
    private List<Instruction> instructions;
    private int prepTime;
    private int cookTime;
    private int servings;
    private String difficulty; // easy, medium, hard
    private String mealType;
    private String cuisine;
    private List<String> tags;
    private NutritionalInfo nutritionalInfo;
    private String imageUrl;
    private long views;

    public RecipeResponse() {}

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }

    public List<Instruction> getInstructions() {
        return instructions;
    }

    public void setInstructions(List<Instruction> instructions) {
        this.instructions = instructions;
    }

    public int getPrepTime() {
        return prepTime;
    }

    public void setPrepTime(int prepTime) {
        this.prepTime = prepTime;
    }

    public int getCookTime() {
        return cookTime;
    }

    public void setCookTime(int cookTime) {
        this.cookTime = cookTime;
    }

    public int getServings() {
        return servings;
    }

    public void setServings(int servings) {
        this.servings = servings;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getCuisine() {
        return cuisine;
    }

    public void setCuisine(String cuisine) {
        this.cuisine = cuisine;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public NutritionalInfo getNutritionalInfo() {
        return nutritionalInfo;
    }

    public void setNutritionalInfo(NutritionalInfo nutritionalInfo) {
        this.nutritionalInfo = nutritionalInfo;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public long getViews() {
        return views;
    }

    public void setViews(long views) {
        this.views = views;
    }

    // Inner classes
    public static class Ingredient {
        private String name;
        private String quantity;
        private String unit;
        private String notes;

        public Ingredient() {}

        public Ingredient(String name, String quantity, String unit) {
            this.name = name;
            this.quantity = quantity;
            this.unit = unit;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getQuantity() { return quantity; }
        public void setQuantity(String quantity) { this.quantity = quantity; }
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class Instruction {
        private int step;
        private String description;
        private Integer duration; // in minutes

        public Instruction() {}

        public Instruction(int step, String description) {
            this.step = step;
            this.description = description;
        }

        // Getters and Setters
        public int getStep() { return step; }
        public void setStep(int step) { this.step = step; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getDuration() { return duration; }
        public void setDuration(Integer duration) { this.duration = duration; }
    }

    public static class NutritionalInfo {
        private int calories;
        private double protein; // grams
        private double carbohydrates; // grams
        private double fat; // grams
        private double fiber; // grams
        private Double sugar; // grams
        private Integer sodium; // milligrams

        public NutritionalInfo() {}

        // Getters and Setters
        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }
        public double getProtein() { return protein; }
        public void setProtein(double protein) { this.protein = protein; }
        public double getCarbohydrates() { return carbohydrates; }
        public void setCarbohydrates(double carbohydrates) { this.carbohydrates = carbohydrates; }
        public double getFat() { return fat; }
        public void setFat(double fat) { this.fat = fat; }
        public double getFiber() { return fiber; }
        public void setFiber(double fiber) { this.fiber = fiber; }
        public Double getSugar() { return sugar; }
        public void setSugar(Double sugar) { this.sugar = sugar; }
        public Integer getSodium() { return sodium; }
        public void setSodium(Integer sodium) { this.sodium = sodium; }
    }
}
