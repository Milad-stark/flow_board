package com.flowboard.service;

import com.flowboard.model.ChatMessage;
import com.flowboard.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatbotService {
    private final ChatMessageRepository chatMessageRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${chatbot.api.url:}")
    private String chatbotApiUrl;

    @Value("${chatbot.api.key:}")
    private String chatbotApiKey;

    public String sendMessage(UUID userId, String message, Map<String, Object> context) {
        String response;
        
        if (chatbotApiUrl != null && !chatbotApiUrl.isEmpty()) {
            // Call external chatbot API
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("Content-Type", "application/json");
                if (chatbotApiKey != null && !chatbotApiKey.isEmpty()) {
                    headers.set("Authorization", "Bearer " + chatbotApiKey);
                }

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("message", message);
                requestBody.put("context", context);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> responseEntity = restTemplate.exchange(
                    chatbotApiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
                );

                Map<String, Object> responseBody = responseEntity.getBody();
                response = responseBody != null && responseBody.containsKey("response") 
                    ? responseBody.get("response").toString() 
                    : "I'm sorry, I couldn't process your request.";
            } catch (Exception e) {
                response = "I'm sorry, there was an error processing your request. Please try again later.";
            }
        } else {
            // Mock response when no API is configured
            response = "This is a mock response. Please configure CHATBOT_API_URL and CHATBOT_API_KEY environment variables.";
        }

        // Save message to database
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUserId(userId);
        chatMessage.setMessage(message);
        chatMessage.setResponse(response);
        chatMessage.setContext(context != null ? context.toString() : null);
        chatMessageRepository.save(chatMessage);

        return response;
    }

    public List<ChatMessage> getHistory(UUID userId) {
        return chatMessageRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}

