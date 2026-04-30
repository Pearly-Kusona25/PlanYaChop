package com.smartrecipe.routes;

import com.smartrecipe.model.FavoriteRecipe;
import com.smartrecipe.model.Recipe;
import com.smartrecipe.model.User;
import com.smartrecipe.repository.FavoriteRecipeRepository;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import com.smartrecipe.service.SystemActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("hasAnyRole('USER','ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FavoritesController {

    @Autowired
    private FavoriteRecipeRepository favoriteRecipeRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemActivityService systemActivityService;

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoriteIds(Authentication authentication) {
        User user = requireUser(authentication);
        List<Long> ids = favoriteRecipeRepository.findByUserId(user.getId())
            .stream()
            .map((favorite) -> favorite.getRecipe().getId())
            .toList();
        return ResponseEntity.ok(ids);
    }

    @PostMapping("/{recipeId}")
    public ResponseEntity<Map<String, Object>> addFavorite(@PathVariable Long recipeId,
                                                           Authentication authentication) {
        User user = requireUser(authentication);
        Recipe recipe = recipeRepository.findById(recipeId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipe not found"));

        if (favoriteRecipeRepository.existsByUserIdAndRecipeId(user.getId(), recipeId)) {
            return ResponseEntity.ok(statusPayload(recipeId, true, "Recipe already in favorites"));
        }

        FavoriteRecipe favorite = new FavoriteRecipe();
        favorite.setUser(user);
        favorite.setRecipe(recipe);
        favoriteRecipeRepository.save(favorite);
        systemActivityService.info(
            "USER_ACTIVITY",
            "FAVORITE_ADDED",
            user.getUsername(),
            "Added recipe to favorites: " + recipe.getTitle()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(statusPayload(recipeId, true, "Added to favorites"));
    }

    @DeleteMapping("/{recipeId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(@PathVariable Long recipeId,
                                                              Authentication authentication) {
        User user = requireUser(authentication);
        favoriteRecipeRepository.findByUserIdAndRecipeId(user.getId(), recipeId)
            .ifPresent(favoriteRecipeRepository::delete);
        systemActivityService.info(
            "USER_ACTIVITY",
            "FAVORITE_REMOVED",
            user.getUsername(),
            "Removed recipe from favorites (id=" + recipeId + ")"
        );
        return ResponseEntity.ok(statusPayload(recipeId, false, "Removed from favorites"));
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByUsername(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }

    private Map<String, Object> statusPayload(Long recipeId, boolean favorite, String message) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("recipeId", recipeId);
        payload.put("favorite", favorite);
        payload.put("message", message);
        return payload;
    }
}
