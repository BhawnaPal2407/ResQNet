package com.example.ResQNet.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NGO {
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
