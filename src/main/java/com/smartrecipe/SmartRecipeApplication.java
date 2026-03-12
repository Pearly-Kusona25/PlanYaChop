package com.smartrecipe;

import com.smartrecipe.model.User;
import com.smartrecipe.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class SmartRecipeApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartRecipeApplication.class, args);
    }

    @Bean
    CommandLineRunner ensureAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminUsername = System.getenv("ADMIN_USERNAME");
            String adminPassword = System.getenv("ADMIN_PASSWORD");
            String adminEmail = System.getenv("ADMIN_EMAIL");

            if (adminUsername != null && adminPassword != null) {
                boolean adminExists = userRepository
                    .findByUsernameOrEmail(adminUsername, adminEmail != null ? adminEmail : adminUsername)
                    .isPresent();

                if (!adminExists) {
                    User admin = new User();
                    admin.setUsername(adminUsername);
                    admin.setEmail(adminEmail != null ? adminEmail : adminUsername + "@example.com");
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setRole("ADMIN");
                    userRepository.save(admin);
                }
            }
        };
    }
}
