package com.smartrecipe.repository;

import com.smartrecipe.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findTop5ByOrderByIdDesc();
    List<Recipe> findTop10ByViewCountGreaterThanOrderByViewCountDescIdDesc(Long minimumViewCount);
    List<Recipe> findByMealType(Recipe.MealType mealType);
    Optional<Recipe> findByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCase(String title);
    List<Recipe> findByTagsContaining(String tag);
}
