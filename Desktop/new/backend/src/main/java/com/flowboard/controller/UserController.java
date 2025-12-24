package com.flowboard.controller;

import com.flowboard.dto.ApiResponse;
import com.flowboard.model.User;
import com.flowboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers(
            @RequestParam(required = false) String orderBy) {
        List<User> users;
        if (orderBy != null && orderBy.startsWith("-")) {
            String field = orderBy.substring(1);
            users = userRepository.findAll(Sort.by(Sort.Direction.DESC, field));
        } else if (orderBy != null) {
            users = userRepository.findAll(Sort.by(Sort.Direction.ASC, orderBy));
        } else {
            users = userRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}

