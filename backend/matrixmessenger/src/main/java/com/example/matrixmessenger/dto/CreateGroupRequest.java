package com.example.matrixmessenger.dto;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CreateGroupRequest {
    
    @NotBlank(message = "Group name is required")
    private String name;

    @NotEmpty(message = "At least one member is required")
    private List<String> memberIds;

    private Map<String,String> encryptedGroupKey; // Map of userId to encrypted group key

}
