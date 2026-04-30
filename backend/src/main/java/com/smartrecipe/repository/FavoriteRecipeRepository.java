package com.smartrecipe.repository;

import com.smartrecipe.model.FavoriteRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRecipeRepository extends JpaRepository<FavoriteRecipe, Long> {

    List<FavoriteRecipe> findByUserId(Long userId);

    Optional<FavoriteRecipe> findByUserIdAndRecipeId(Long userId, Long recipeId);

    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    @Query("select f.recipe.id, count(f.id) from FavoriteRecipe f group by f.recipe.id")
    List<Object[]> countFavoritesGroupedByRecipe();
}
