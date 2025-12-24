package com.flowboard.controller;

import com.flowboard.dto.ApiResponse;
import com.flowboard.model.Project;
import com.flowboard.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {
    private final ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Project>>> getAllProjects(
            @RequestParam(required = false) String orderBy) {
        List<Project> projects;
        if (orderBy != null && orderBy.startsWith("-")) {
            String field = orderBy.substring(1);
            projects = projectRepository.findAll(Sort.by(Sort.Direction.DESC, field));
        } else if (orderBy != null) {
            projects = projectRepository.findAll(Sort.by(Sort.Direction.ASC, orderBy));
        } else {
            projects = projectRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProject(@PathVariable UUID id) {
        return projectRepository.findById(id)
                .map(project -> ResponseEntity.ok(ApiResponse.success(project)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project project) {
        Project saved = projectRepository.save(project);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> updateProject(
            @PathVariable UUID id,
            @RequestBody Project project) {
        return projectRepository.findById(id)
                .map(existing -> {
                    if (project.getName() != null) existing.setName(project.getName());
                    if (project.getDescription() != null) existing.setDescription(project.getDescription());
                    if (project.getColor() != null) existing.setColor(project.getColor());
                    if (project.getStatus() != null) existing.setStatus(project.getStatus());
                    return ResponseEntity.ok(ApiResponse.success(projectRepository.save(existing)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID id) {
        projectRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

