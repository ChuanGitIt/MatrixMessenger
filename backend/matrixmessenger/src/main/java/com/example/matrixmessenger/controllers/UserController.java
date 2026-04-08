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
    public ResponseEntity<?> getUserByID(@PathVariable String userID) {
        var user = userService.getUserByID(userID);
        if (user == null) {
            return ResponseEntity.status(404).body("User with ID " + userID + " does not exist");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        var user = userService.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.status(404).body("User with username " + username + " does not exist");
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

}
