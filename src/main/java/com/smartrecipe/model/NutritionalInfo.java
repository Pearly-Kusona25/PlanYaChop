package com.smartrecipe.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "nutritional_info")
public class NutritionalInfo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Min(value = 0, message = "Calories cannot be negative")
    private Integer calories;
    
    @Min(value = 0, message = "Protein cannot be negative")
    private Double protein; // grams
    
    @Min(value = 0, message = "Carbohydrates cannot be negative")
    private Double carbohydrates; // grams
    
    @Min(value = 0, message = "Fat cannot be negative")
    private Double fat; // grams
    
    @Min(value = 0, message = "Fiber cannot be negative")
    private Double fiber; // grams
    
    private Double sugar; // grams
    private Integer sodium; // milligrams
    
    @OneToOne(mappedBy = "nutritionalInfo", cascade = CascadeType.ALL)
    private Recipe recipe;

    public NutritionalInfo() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Integer getCalories() { return calories; }
    public void setCalories(Integer calories) { this.calories = calories; }
    
    public Double getProtein() { return protein; }
    public void setProtein(Double protein) { this.protein = protein; }
    
    public Double getCarbohydrates() { return carbohydrates; }
    public void setCarbohydrates(Double carbohydrates) { this.carbohydrates = carbohydrates; }
    
    public Double getFat() { return fat; }
    public void setFat(Double fat) { this.fat = fat; }
    
    public Double getFiber() { return fiber; }
    public void setFiber(Double fiber) { this.fiber = fiber; }
    
    public Double getSugar() { return sugar; }
    public void setSugar(Double sugar) { this.sugar = sugar; }
    
    public Integer getSodium() { return sodium; }
    public void setSodium(Integer sodium) { this.sodium = sodium; }
    
    public Recipe getRecipe() { return recipe; }
    public void setRecipe(Recipe recipe) { this.recipe = recipe; }
}
