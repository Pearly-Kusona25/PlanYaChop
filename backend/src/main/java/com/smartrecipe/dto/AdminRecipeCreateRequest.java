package com.smartrecipe.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class AdminRecipeCreateRequest {

    @NotBlank(message = "Recipe title is required")
    private String title;

    private String description;

    @NotNull(message = "Prep time is required")
    @Min(value = 1, message = "Prep time must be at least 1 minute")
    private Integer prepTime;

    @NotNull(message = "Cook time is required")
    @Min(value = 1, message = "Cook time must be at least 1 minute")
    private Integer cookTime;

    @NotNull(message = "Servings is required")
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings;

    private String difficulty;

    private String mealType;

    private String cuisine;

    private List<String> tags = new ArrayList<>();

    private String imageUrl;

    private List<String> ingredientLines = new ArrayList<>();

    private List<String> instructionLines = new ArrayList<>();

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

    public Integer getPrepTime() {
        return prepTime;
    }

    public void setPrepTime(Integer prepTime) {
        this.prepTime = prepTime;
    }

    public Integer getCookTime() {
        return cookTime;
    }

    public void setCookTime(Integer cookTime) {
        this.cookTime = cookTime;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getIngredientLines() {
        return ingredientLines;
    }

    public void setIngredientLines(List<String> ingredientLines) {
        this.ingredientLines = ingredientLines;
    }

    public List<String> getInstructionLines() {
        return instructionLines;
    }

    public void setInstructionLines(List<String> instructionLines) {
        this.instructionLines = instructionLines;
    }
}
