package com.example.matrixmessenger.repo;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.matrixmessenger.models.Post;


public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findAllByOrderByTimestampAsc();
}