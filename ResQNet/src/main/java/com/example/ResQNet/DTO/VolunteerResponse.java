package com.example.ResQNet.DTO;

import com.example.ResQNet.Models.Verificationstatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VolunteerResponse {
    private Long id;
    private Long userId;
    private String volunteerName;
    private String organizationName;
    private String services;
    private String serviceArea;
    private Boolean available;
    private Verificationstatus verificationStatus;
    private String contactName;
    private String contactPhone;
    private LocalDateTime createdAt;
}
