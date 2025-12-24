package com.flowboard.controller;

import com.flowboard.dto.ApiResponse;
import com.flowboard.model.ChatMessage;
import com.flowboard.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {
    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendMessage(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {
        // Get userId from authentication principal (stored as UUID string)
        String userIdStr = authentication.getName();
        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid user ID"));
        }
        
        String message = (String) request.get("message");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) request.getOrDefault("context", Map.of());
        
        String response = chatbotService.sendMessage(userId, message, context);
        
        return ResponseEntity.ok(ApiResponse.success(Map.of("response", response)));
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getHistory(@PathVariable UUID userId) {
        List<ChatMessage> history = chatbotService.getHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}

