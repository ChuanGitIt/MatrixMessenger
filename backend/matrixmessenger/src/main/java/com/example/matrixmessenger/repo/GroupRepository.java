package com.example.matrixmessenger.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.matrixmessenger.models.Group;

public interface GroupRepository extends MongoRepository<Group, String>{

	List<Group> findAll();

}
