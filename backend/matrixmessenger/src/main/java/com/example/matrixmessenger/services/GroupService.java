package com.example.matrixmessenger.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.matrixmessenger.dto.CreateGroupRequest;
import com.example.matrixmessenger.models.Group;
import com.example.matrixmessenger.repo.GroupRepository;
import com.example.matrixmessenger.repo.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    
    public Map<String, String> createGroup(CreateGroupRequest request) {
        Map<String, String> response = new HashMap<>();
        //check all member IDs are valid
        for (String memberId : request.getMemberIds()) {
            if (!userRepository.existsById(memberId)) {
                response.put("error", "User with ID " + memberId + " does not exist");
                return response;
            }
        }

        Group newGroup = new Group();
        newGroup.setName(request.getName());
        newGroup.setMemberIds(request.getMemberIds());

        groupRepository.save(newGroup);
        response.put("message", "Group " + newGroup.getName() + ", ID: " + newGroup.getId() + " created successfully"+
        "\n with members: " + newGroup.getMemberIds());
        return response;
    } 

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public void deleteAllGroups() {
        groupRepository.deleteAll();
    }
}
