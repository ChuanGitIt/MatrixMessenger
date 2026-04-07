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
        for (String memberId : request.getMemberIDs()) {
            if (!userRepository.existsById(memberId)) {
                response.put("error", "User with ID " + memberId + " does not exist");
                return response;
            }
        }

        Group newGroup = new Group();
        newGroup.setName(request.getName());
        newGroup.setMemberIds(request.getMemberIDs());
        newGroup.setEncryptionKeys(request.getEncryptedGroupKey());

        groupRepository.save(newGroup);
        response.put("message", "Group " + newGroup.getName() + ", ID: " + newGroup.getId() + " created successfully"+
        "\n with members: " + newGroup.getMemberIds());
        return response;
    } 

    public Map<String,String> deleteGroup(String groupId) {
        Map<String, String> response = new HashMap<>();
        if (!groupRepository.existsById(groupId)) {
            response.put("error", "Group with ID " + groupId + " does not exist");
            return response;
        }
        groupRepository.deleteById(groupId);
        response.put("message", "Group with ID " + groupId + " deleted successfully");
        return response;
    }

    public Map<String,String> addMemberToGroup(String groupId, String memberId) {
        Map<String, String> response = new HashMap<>();
        if (!groupRepository.existsById(groupId)) {
            response.put("error", "Group with ID " + groupId + " does not exist");
            return response;
        }
        if (!userRepository.existsById(memberId)) {
            response.put("error", "User with ID " + memberId + " does not exist");
            return response;
        }
        Group group = groupRepository.findById(groupId).get();
        List<String> members = group.getMemberIds();
        if (members.contains(memberId)) {
            response.put("error", "User with ID " + memberId + " is already a member of the group");
            return response;
        }
        members.add(memberId);
        group.setMemberIds(members);
        groupRepository.save(group);
        response.put("message", "User with ID " + memberId + " added to group with ID " + groupId);
        return response;
    }

    public Map<String,String> removeMemberFromGroup(String groupId, String memberId) {
        Map<String, String> response = new HashMap<>();
        if (!groupRepository.existsById(groupId)) {
            response.put("error", "Group with ID " + groupId + " does not exist");
            return response;
        }
        if (!userRepository.existsById(memberId)) {
            response.put("error", "User with ID " + memberId + " does not exist");
            return response;
        }
        Group group = groupRepository.findById(groupId).get();
        List<String> members = group.getMemberIds();
        if (!members.contains(memberId)) {
            response.put("error", "User with ID " + memberId + " is not a member of the group");
            return response;
        }
        members.remove(memberId);
        group.setMemberIds(members);
        groupRepository.save(group);
        response.put("message", "User with ID " + memberId + " removed from group with ID " + groupId);
        return response;
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public void deleteAllGroups() {
        groupRepository.deleteAll();
    }
}
