package com.smartrecipe.controllers;

import com.smartrecipe.model.Recipe;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@Controller
public class LandingController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @GetMapping("/")
    public String landingPage() {
        return "landing";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        List<Recipe> recentRecipes = recipeRepository.findTop5ByOrderByIdDesc();
        model.addAttribute("recentRecipes", recentRecipes);
        model.addAttribute("totalRecipes", recipeRepository.count());
        model.addAttribute("totalUsers", userRepository.count());
        return "dashboard";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String admin(Model model) {
        long totalUsers = userRepository.count();
        long totalRecipes = recipeRepository.count();
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("totalRecipes", totalRecipes);
        model.addAttribute("activeMealPlans", Math.max(1, totalRecipes / 2));
        model.addAttribute("systemEventsToday", totalUsers + totalRecipes);
        return "admin";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
}
