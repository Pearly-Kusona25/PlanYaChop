package com.smartrecipe.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MealPlanRequest {
    
    @NotNull(message = "Days cannot be null")
    @Min(value = 1, message = "Days must be at least 1")
    @Max(value = 30, message = "Days cannot exceed 30")
    private Integer days;
    
    @NotNull(message = "Meals per day cannot be null")
    @Min(value = 1, message = "Meals per day must be at least 1")
    @Max(value = 10, message = "Meals per day cannot exceed 10")
    private Integer mealsPerDay;
    
    private List<String> dietaryRestrictions;
    private List<String> cuisinePreferences;
    private Integer budget;

    public MealPlanRequest() {}

    public MealPlanRequest(Integer days, Integer mealsPerDay, List<String> dietaryRestrictions, 
                          List<String> cuisinePreferences, Integer budget) {
        this.days = days;
        this.mealsPerDay = mealsPerDay;
        this.dietaryRestrictions = dietaryRestrictions;
        this.cuisinePreferences = cuisinePreferences;
        this.budget = budget;
    }

    // Getters and Setters
    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public Integer getMealsPerDay() {
        return mealsPerDay;
    }

    public void setMealsPerDay(Integer mealsPerDay) {
        this.mealsPerDay = mealsPerDay;
    }

    public List<String> getDietaryRestrictions() {
        return dietaryRestrictions;
    }

    public void setDietaryRestrictions(List<String> dietaryRestrictions) {
        this.dietaryRestrictions = dietaryRestrictions;
    }

    public List<String> getCuisinePreferences() {
        return cuisinePreferences;
    }

    public void setCuisinePreferences(List<String> cuisinePreferences) {
        this.cuisinePreferences = cuisinePreferences;
    }

    public Integer getBudget() {
        return budget;
    }

    public void setBudget(Integer budget) {
        this.budget = budget;
    }
}
