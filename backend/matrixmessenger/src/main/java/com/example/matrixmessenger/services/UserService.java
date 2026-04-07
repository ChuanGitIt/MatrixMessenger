package com.example.matrixmessenger.services;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.matrixmessenger.models.User;
import com.example.matrixmessenger.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public Map<String,String> getUserPublicKeyAndCertificate(String userID){
        User user = userRepository.findById(userID).orElse(null);
        if (user == null) {
            return Map.of("error", "User with ID " + userID + " does not exist");
        }
        return Map.of(
            "publicKey", user.getPublicKey(),
            "certificate", user.getCertificate()
        );
    }

    public Map<String, Object> getAllUsers() {
        return Map.of("users", userRepository.findAll());
    }
}
