package com.example.matrixmessenger.models;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    
    private List<String> memberIds;

    //AES encryption key for the group, should be securely generated and stored
    private Map<String, String> encryptionKeys; // Map of userId to encrypted AES key for that user
}
