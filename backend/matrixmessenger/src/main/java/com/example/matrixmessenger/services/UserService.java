package com.example.matrixmessenger.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.matrixmessenger.models.User;
import com.example.matrixmessenger.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User getUserByID(String userID) {
        return userRepository.findById(userID).orElse(null);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
