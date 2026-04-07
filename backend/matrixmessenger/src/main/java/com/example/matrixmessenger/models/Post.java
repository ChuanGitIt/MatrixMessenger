package com.example.matrixmessenger.models;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "posts")
public class Post {
    @Id
    private String id;

    private String senderID;
    private String groupID; // null for direct messages
    private String cipherText; // AES encrypted message content
    private String iv; // Initialization Vector for AES encryption
    private Instant timestamp;
}
