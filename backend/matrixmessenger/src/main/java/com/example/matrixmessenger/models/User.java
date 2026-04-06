package com.example.matrixmessenger.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String username;
    private String password; //hashed

    private String publicKey; // for end-to-end encryption
    private String certificate;
}
