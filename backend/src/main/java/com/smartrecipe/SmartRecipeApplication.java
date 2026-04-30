package com.smartrecipe;

import com.smartrecipe.model.User;
import com.smartrecipe.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmartRecipeApplication {

    private static final Logger log = LoggerFactory.getLogger(SmartRecipeApplication.class);

    @Value("${admin.default.username:admin}")
    private String defaultAdminUsername;

    @Value("${admin.default.password:Admin123!}")
    private String defaultAdminPassword;

    @Value("${admin.default.email:admin@planyachop.local}")
    private String defaultAdminEmail;

    public static void main(String[] args) {
        SpringApplication.run(SmartRecipeApplication.class, args);
    }

    @Bean
    CommandLineRunner ensureAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = System.getenv().getOrDefault("ADMIN_USERNAME", defaultAdminUsername);
            String adminPassword = System.getenv().getOrDefault("ADMIN_PASSWORD", defaultAdminPassword);
            String adminEmail = System.getenv().getOrDefault("ADMIN_EMAIL", defaultAdminEmail);

            User admin = userRepository
                .findByUsernameOrEmail(adminUsername, adminEmail)
                .orElseGet(User::new);

            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail != null ? adminEmail : adminUsername + "@example.com");
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            admin.setFirstName(admin.getFirstName() != null ? admin.getFirstName() : "Admin");
            admin.setLastName(admin.getLastName() != null ? admin.getLastName() : "User");

            userRepository.save(admin);
            log.info("Ensured default admin '{}' (email: {}). Password reset on startup; change it.", adminUsername, admin.getEmail());
        };
    }
}
