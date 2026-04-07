package com.example.matrixmessenger.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserManage {
    @NotBlank(message = "User ID is required")
    private String userID;

    @NotBlank(message = "Group ID is required")
    private String groupID;
}
