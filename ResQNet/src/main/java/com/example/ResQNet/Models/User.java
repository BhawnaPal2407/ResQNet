package com.example.ResQNet.Models;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String passwordHash;
    private Role role;
    private LocalDateTime createdAt;
}
