package com.smartrecipe.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class RecipeRequest {
    
    @NotEmpty(message = "Ingredients cannot be empty")
    private List<String> ingredients;
    
    private List<String> dietaryRestrictions;

    public RecipeRequest() {}

    public RecipeRequest(List<String> ingredients, List<String> dietaryRestrictions) {
        this.ingredients = ingredients;
        this.dietaryRestrictions = dietaryRestrictions;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getDietaryRestrictions() {
        return dietaryRestrictions;
    }

    public void setDietaryRestrictions(List<String> dietaryRestrictions) {
        this.dietaryRestrictions = dietaryRestrictions;
    }
}
