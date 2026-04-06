package com.example.matrixmessenger.services;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.matrixmessenger.repo.UserRepository;
import com.example.matrixmessenger.dto.RegisterRequest;
import com.example.matrixmessenger.models.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public Map<String, String> register(RegisterRequest request) {
        Map<String, String> response = new HashMap<>();
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            response.put("error", "Username already exists, change to another one");
            return response;
        }
        // Create new user and save to database
        User newUser = new User();
        newUser.setUsername(request.getUsername());
        newUser.setPassword(passwordEncoder.encode(request.getPassword())); //BCrypt hashing

        userRepository.save(newUser);
        response.put("message", "User " + newUser.getUsername() + ", ID: " + newUser.getId() + " registered successfully");
        return response;
    }

    public Map<String, String> login (String username, String password) {
        Map<String, String> response = new HashMap<>();
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (!userOptional.isPresent()) {
            response.put("error", "Invalid username");
            return response;
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("error", "Invalid password");
            return response;
        }
        
        response.put("message", "User " + user.getUsername() + ", ID: " + user.getId() + " logged in successfully");
        return response;
    }

}
