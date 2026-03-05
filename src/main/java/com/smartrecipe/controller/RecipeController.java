package com.smartrecipe.controller;

import com.smartrecipe.dto.RecipeRequest;
import com.smartrecipe.dto.RecipeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RecipeController {

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Recipe API is running");
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecipeResponse> generateRecipe(@RequestBody RecipeRequest request) {
        // TODO: Implement AI integration when ready
        RecipeResponse response = new RecipeResponse();
        response.setTitle("Sample Recipe");
        response.setIngredients(Collections.emptyList());
        response.setInstructions(Collections.emptyList());
        response.setPrepTime(10);
        response.setCookTime(20);
        response.setServings(4);
        response.setDifficulty("easy");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RecipeResponse>> getUserRecipes() {
        // TODO: Implement user recipe retrieval
        return ResponseEntity.ok(Collections.emptyList());
    }
}
