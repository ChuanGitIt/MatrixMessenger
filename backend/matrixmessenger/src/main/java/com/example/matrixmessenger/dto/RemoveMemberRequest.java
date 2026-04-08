package com.example.matrixmessenger.dto;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RemoveMemberRequest {
    @NotBlank (message = "Group ID is required")
    private String groupID;
    @NotBlank (message = "User ID is required")
    private String userID;
    @NotBlank (message = "Encrypted group key is required")
    private Map<String, String> encryptedGroupKeys; // New encrypted group keys for the remaining members after removal
}
