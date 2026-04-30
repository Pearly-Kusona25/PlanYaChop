package com.smartrecipe.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class IngredientAnalysisRequest {
    
    @NotEmpty(message = "Ingredients cannot be empty")
    private List<String> ingredients;

    public IngredientAnalysisRequest() {}

    public IngredientAnalysisRequest(List<String> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<String> ingredients) {
        this.ingredients = ingredients;
    }
}
