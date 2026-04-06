package com.example.matrixmessenger.controllers;

import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.matrixmessenger.repo.UserRepository;
import com.example.matrixmessenger.services.AuthenticationService;
import com.example.matrixmessenger.dto.LoginRequest;
import com.example.matrixmessenger.dto.RegisterRequest;
import com.example.matrixmessenger.models.User;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest registerRequest) {
        Map<String, String> result = authenticationService.register(registerRequest);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok(result.get("message"));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        Map<String, String> result = authenticationService.login(loginRequest.getUsername(), loginRequest.getPassword());
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok(result.get("message"));
    }
}
