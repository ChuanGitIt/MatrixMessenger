package com.example.matrixmessenger.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotBlank(message = "Group ID is required")
    private String groupID;
    @NotBlank(message = "User ID is required")
    private String userID;
    @NotBlank(message = "Encrypted group key is required")
    private String encryptedGroupKey; // Encrypted group key for the new member
}
