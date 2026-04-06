package com.example.matrixmessenger.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.matrixmessenger.dto.MakePostRequest;
import com.example.matrixmessenger.models.Post;
import com.example.matrixmessenger.services.PostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    
    @PostMapping("/create")
    public ResponseEntity<String> createPost(@RequestBody MakePostRequest request) {
        Map<String, String> result = postService.makePost(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok().body(result.get("message"));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
    
}
