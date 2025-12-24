package com.flowboard.controller;

import com.flowboard.config.JwtUtil;
import com.flowboard.dto.ApiResponse;
import com.flowboard.dto.AuthRequest;
import com.flowboard.dto.RegisterRequest;
import com.flowboard.model.User;
import com.flowboard.repository.UserRepository;
import com.flowboard.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Map<String, Object> result = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody AuthRequest request) {
        try {
            Map<String, Object> result = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateCurrentUser(
            Authentication authentication,
            @RequestBody User userData) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userData.getFullName() != null) user.setFullName(userData.getFullName());
        if (userData.getJobRole() != null) user.setJobRole(userData.getJobRole());
        if (userData.getLanguage() != null) user.setLanguage(userData.getLanguage());
        if (userData.getTheme() != null) user.setTheme(userData.getTheme());
        if (userData.getAvatarUrl() != null) user.setAvatarUrl(userData.getAvatarUrl());
        if (userData.getNotificationsEnabled() != null) user.setNotificationsEnabled(userData.getNotificationsEnabled());
        if (userData.getSoundEnabled() != null) user.setSoundEnabled(userData.getSoundEnabled());
        
        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}

