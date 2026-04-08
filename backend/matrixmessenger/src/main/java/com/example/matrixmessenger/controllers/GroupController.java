package com.example.matrixmessenger.controllers;

import java.util.Map;

import org.springframework.data.mongodb.core.aggregation.ArithmeticOperators.Add;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.matrixmessenger.dto.AddMemberRequest;
import com.example.matrixmessenger.dto.CreateGroupRequest;
import com.example.matrixmessenger.dto.RemoveMemberRequest;
import com.example.matrixmessenger.dto.UserManage;
import com.example.matrixmessenger.services.GroupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;
    
    @PostMapping("/create")
    public ResponseEntity<String> createGroup(@RequestBody CreateGroupRequest request) {
        Map<String, String> result = groupService.createGroup(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok(result.get("message"));
    }

    @PostMapping("/addMember")
    public ResponseEntity<String> addMemberToGroup(@RequestBody AddMemberRequest request) {
        Map<String, String> result = groupService.addMemberToGroup(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok(result.get("message"));
    }

    @PostMapping("/removeMember")
    public ResponseEntity<String> removeMemberFromGroup(@RequestBody RemoveMemberRequest request) {
        Map<String, String> result = groupService.removeMemberFromGroup(request);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result.get("error"));
        }
        return ResponseEntity.ok(result.get("message"));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllGroups() {
        groupService.deleteAllGroups();
        return ResponseEntity.ok("All groups deleted successfully.");
    }

}
