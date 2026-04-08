package com.example.matrixmessenger.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.matrixmessenger.dto.AddMemberRequest;
import com.example.matrixmessenger.dto.CreateGroupRequest;
import com.example.matrixmessenger.dto.RemoveMemberRequest;
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

    public Group getGroupById(String groupId) {
        return groupRepository.findById(groupId).orElse(null);
    }

    public Map<String,String> addMemberToGroup(AddMemberRequest request) {
        Map<String, String> response = new HashMap<>();
        if (!groupRepository.existsById(request.getGroupID())) {
            response.put("error", "Group with ID " + request.getGroupID() + " does not exist");
            return response;
        }
        if (!userRepository.existsById(request.getUserID())) {
            response.put("error", "User with ID " + request.getUserID() + " does not exist");
            return response;
        }
        Group group = groupRepository.findById(request.getGroupID()).get();
        List<String> members = group.getMemberIds();
        if (members.contains(request.getUserID())) {
            response.put("error", "User with ID " + request.getUserID() + " is already a member of the group");
            return response;
        }
        members.add(request.getUserID());
        group.setMemberIds(members);

        // Add the encrypted group key for the new member
        group.getEncryptionKeys().put(request.getUserID(), request.getEncryptedGroupKey());

        groupRepository.save(group);
        response.put("message", "User with ID " + request.getUserID() + " added to group with ID " + request.getGroupID());
        return response;
    }

    public Map<String,String> removeMemberFromGroup(RemoveMemberRequest request) {
        Map<String, String> response = new HashMap<>();
        if (!groupRepository.existsById(request.getGroupID())) {
            response.put("error", "Group with ID " + request.getGroupID() + " does not exist");
            return response;
        }
        if (!userRepository.existsById(request.getUserID())) {
            response.put("error", "User with ID " + request.getUserID() + " does not exist");
            return response;
        }
        Group group = groupRepository.findById(request.getGroupID()).get();
        List<String> members = group.getMemberIds();
        if (!members.contains(request.getUserID())) {
            response.put("error", "User with ID " + request.getUserID() + " is not a member of the group");
            return response;
        }
        members.remove(request.getUserID());
        group.setMemberIds(members);
        //update the encryption keys for the remaining members after removing the user(rotated)
        group.setEncryptionKeys(request.getEncryptedGroupKeys());
        groupRepository.save(group);
        response.put("message", "User with ID " + request.getUserID() + " removed from group with ID " + request.getGroupID());
        return response;
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public void deleteAllGroups() {
        groupRepository.deleteAll();
    }
}
