package com.example.matrixmessenger.services;

import org.springframework.stereotype.Service;

import com.example.matrixmessenger.dto.MakePostRequest;
import com.example.matrixmessenger.models.Post;

import com.example.matrixmessenger.repo.GroupRepository;
import com.example.matrixmessenger.repo.PostRepository;
import com.example.matrixmessenger.repo.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userService;

    public Map<String,String> makePost(MakePostRequest request) {
        // validate senderID
        Map<String, String> response = new HashMap<>();

        if (!userService.existsById(request.getSenderID())) {
            response.put("error", "Invalid sender ID");
            return response;
        }

        // validate groupID if provided
        if (request.getGroupID() != null && !groupRepository.existsById(request.getGroupID())) {
            response.put("error", "Invalid group ID");
            return response;
        }

        // create and save the post
        Post post = new Post();
        post.setSenderID(request.getSenderID());
        post.setGroupID(request.getGroupID());
        post.setCipherText(request.getCipherText());
        post.setIv(request.getIv());
        post.setTimestamp(Instant.now());
        postRepository.save(post);
        response.put("message", "Post ID=" + post.getId() + " created successfully");
        return response;
    }
    
        public List<Post> getAllPostsOrdered() {
            return postRepository.findAllByOrderByTimestampAsc();
        }
}
