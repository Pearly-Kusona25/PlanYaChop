package com.smartrecipe.routes;

import com.smartrecipe.dto.LoginRequest;
import com.smartrecipe.dto.RegisterRequest;
import com.smartrecipe.dto.AuthResponse;
import com.smartrecipe.service.AuthService;
import com.smartrecipe.service.SystemActivityService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private SystemActivityService systemActivityService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest,
                                              HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        try {
            AuthResponse authResponse = authService.authenticateUser(loginRequest, clientIp);
            return ResponseEntity.ok(authResponse);
        } catch (AuthenticationException ex) {
            systemActivityService.warn(
                "AUTH",
                "LOGIN_FAILED",
                loginRequest.getUsernameOrEmail(),
                "Authentication failed"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid username/email or password."));
        } catch (ResponseStatusException ex) {
            systemActivityService.warn(
                "AUTH",
                "LOGIN_FAILED",
                loginRequest.getUsernameOrEmail(),
                ex.getReason() != null ? ex.getReason() : "Login failed"
            );
            String message = ex.getReason() != null ? ex.getReason() : "Login failed";
            return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("message", message));
        } catch (RuntimeException ex) {
            systemActivityService.warn(
                "AUTH",
                "LOGIN_FAILED",
                loginRequest.getUsernameOrEmail(),
                ex.getMessage() != null ? ex.getMessage() : "Login failed"
            );
            String message = ex.getMessage() != null ? ex.getMessage() : "Login failed";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest,
                                          HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        try {
            AuthResponse authResponse = authService.registerUser(registerRequest, clientIp);
            return ResponseEntity.ok(authResponse);
        } catch (ResponseStatusException ex) {
            systemActivityService.warn(
                "AUTH",
                "REGISTER_FAILED",
                registerRequest.getUsername(),
                ex.getReason() != null ? ex.getReason() : "Registration failed"
            );
            String message = ex.getReason() != null ? ex.getReason() : "Registration failed";
            return ResponseEntity.status(ex.getStatusCode())
                .body(Map.of("message", message));
        } catch (RuntimeException ex) {
            systemActivityService.warn(
                "AUTH",
                "REGISTER_FAILED",
                registerRequest.getUsername(),
                ex.getMessage() != null ? ex.getMessage() : "Registration failed"
            );
            String message = ex.getMessage() != null ? ex.getMessage() : "Registration failed";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        String token = refreshToken.replace("Bearer", "").trim();
        AuthResponse authResponse = authService.refreshToken(token);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestHeader("Authorization") String token) {
        String accessToken = token.replace("Bearer", "").trim();
        String username = authService.extractUsername(accessToken);
        authService.logoutUser(accessToken);
        systemActivityService.info("AUTH", "LOGOUT", username, "User logged out");
        return ResponseEntity.ok("User logged out successfully");
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
