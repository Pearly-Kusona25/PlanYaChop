package com.smartrecipe.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.smartrecipe.model.Recipe;
import com.smartrecipe.repository.RecipeRepository;
import com.smartrecipe.repository.UserRepository;
import com.smartrecipe.service.SystemActivityService;

@Controller
public class LandingController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private SystemActivityService systemActivityService;

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
        String username = resolveDisplayName();
        model.addAttribute("username", username);
        systemActivityService.info("USER_ACTIVITY", "DASHBOARD_PAGE_VISIT", username, "Visited dashboard page");
        return "dashboard";
    }

    @GetMapping("/home")
    public String home(Model model) {
        String username = resolveDisplayName();
        model.addAttribute("username", username);
        systemActivityService.info("USER_ACTIVITY", "HOME_PAGE_VISIT", username, "Visited home page");
        return "home";
    }

    private String resolveDisplayName() {
        String username = "Chef";
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof com.smartrecipe.middleware.UserPrincipal) {
                username = ((com.smartrecipe.middleware.UserPrincipal) principal).getUsername();
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else if (authentication.getName() != null) {
                username = authentication.getName();
            }
        }
        return username;
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
        systemActivityService.info("ADMIN", "ADMIN_PAGE_VISIT", resolveDisplayName(), "Visited admin portal");
        return "admin";
    }

    @GetMapping("/admin/recipes")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminRecipes() {
        systemActivityService.info("ADMIN", "ADMIN_RECIPES_PAGE_VISIT", resolveDisplayName(), "Visited admin recipes page");
        return "admin-recipes";
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminUsers() {
        systemActivityService.info("ADMIN", "ADMIN_USERS_PAGE_VISIT", resolveDisplayName(), "Visited admin users page");
        return "admin-users";
    }

    @GetMapping("/admin/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminLogs() {
        systemActivityService.info("ADMIN", "ADMIN_LOGS_PAGE_VISIT", resolveDisplayName(), "Visited admin logs page");
        return "admin-logs";
    }

    @GetMapping("/admin/activity")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminActivity() {
        systemActivityService.info("ADMIN", "ADMIN_ACTIVITY_PAGE_VISIT", resolveDisplayName(), "Visited admin activity page");
        return "admin-activity";
    }

    @GetMapping("/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAnalytics(Model model) {
        long totalUsers = userRepository.count();
        long totalRecipes = recipeRepository.count();
        model.addAttribute("totalUsers", totalUsers);
        model.addAttribute("totalRecipes", totalRecipes);
        model.addAttribute("activeMealPlans", Math.max(1, totalRecipes / 2));
        systemActivityService.info("ADMIN", "ADMIN_ANALYTICS_PAGE_VISIT", resolveDisplayName(), "Visited admin analytics page");
        return "admin-analytics";
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
