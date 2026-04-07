package com.example.matrixmessenger.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MakePostRequest {
    
    @NotBlank(message = "Sender ID is required")
    private String senderID;
    private String groupID; // can be null
    @NotBlank(message = "Cipher text is required")
    private String cipherText;

    private String iv; 
}
