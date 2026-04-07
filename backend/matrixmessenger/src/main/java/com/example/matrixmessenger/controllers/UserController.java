package com.example.matrixmessenger.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.matrixmessenger.services.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{userID}")
    public ResponseEntity<?> getUserPublicKeyAndCertificate(@PathVariable String userID) {
        var result = userService.getUserPublicKeyAndCertificate(userID);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

}
