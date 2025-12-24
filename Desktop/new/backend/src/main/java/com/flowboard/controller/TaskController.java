package com.flowboard.controller;

import com.flowboard.dto.ApiResponse;
import com.flowboard.model.Task;
import com.flowboard.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {
    private final TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Task>>> getAllTasks(
            @RequestParam(required = false) String orderBy) {
        List<Task> tasks;
        if (orderBy != null && orderBy.startsWith("-")) {
            String field = orderBy.substring(1);
            tasks = taskRepository.findAll(Sort.by(Sort.Direction.DESC, field));
        } else if (orderBy != null) {
            tasks = taskRepository.findAll(Sort.by(Sort.Direction.ASC, orderBy));
        } else {
            tasks = taskRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<Task>>> filterTasks(
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String orderBy,
            @RequestParam(required = false) Integer limit) {
        List<Task> tasks;
        
        if (assigneeId != null) {
            tasks = taskRepository.findByAssigneeId(assigneeId);
        } else if (projectId != null) {
            tasks = taskRepository.findByProjectId(projectId);
        } else {
            tasks = taskRepository.findAll();
        }
        
        if (status != null) {
            tasks = tasks.stream()
                    .filter(t -> t.getStatus().name().equalsIgnoreCase(status))
                    .toList();
        }
        
        if (orderBy != null && orderBy.startsWith("-")) {
            String field = orderBy.substring(1);
            tasks = tasks.stream()
                    .sorted((a, b) -> {
                        try {
                            Comparable<?> aVal = (Comparable<?>) a.getClass().getField(field).get(a);
                            Comparable<?> bVal = (Comparable<?>) b.getClass().getField(field).get(b);
                            return bVal.compareTo(aVal);
                        } catch (Exception e) {
                            return 0;
                        }
                    })
                    .toList();
        }
        
        if (limit != null && limit > 0) {
            tasks = tasks.stream().limit(limit).toList();
        }
        
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> getTask(@PathVariable UUID id) {
        return taskRepository.findById(id)
                .map(task -> ResponseEntity.ok(ApiResponse.success(task)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Task>> createTask(@RequestBody Task task) {
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Task>> updateTask(
            @PathVariable UUID id,
            @RequestBody Task task) {
        return taskRepository.findById(id)
                .map(existing -> {
                    if (task.getTitle() != null) existing.setTitle(task.getTitle());
                    if (task.getDescription() != null) existing.setDescription(task.getDescription());
                    if (task.getStatus() != null) existing.setStatus(task.getStatus());
                    if (task.getPriority() != null) existing.setPriority(task.getPriority());
                    if (task.getAssigneeId() != null) existing.setAssigneeId(task.getAssigneeId());
                    if (task.getProjectId() != null) existing.setProjectId(task.getProjectId());
                    if (task.getDeadline() != null) existing.setDeadline(task.getDeadline());
                    if (task.getEstimateHours() != null) existing.setEstimateHours(task.getEstimateHours());
                    return ResponseEntity.ok(ApiResponse.success(taskRepository.save(existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable UUID id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

