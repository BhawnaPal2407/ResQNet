package com.example.ResQNet.Models;

import java.time.LocalDateTime;

public class Volunteer {
    private Long id;
    private Long userId;
    private String organizationName;
    private String services;
    private String serviceArea;
    private Boolean available;
    private Verificationstatus verificationStatus;
    private LocalDateTime createdAt;

    private String contactName;
    private String contactPhone;
}
