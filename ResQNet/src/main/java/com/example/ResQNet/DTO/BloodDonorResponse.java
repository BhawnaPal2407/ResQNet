package com.example.ResQNet.DTO;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BloodDonorResponse {
    private Long id;
    private Long userId;
    private String donorName;
    private String donorPhone;
    private String bloodGroup;
    private String city;
    private Double latitude;
    private Double longitude;
    private Boolean available;
    private LocalDate lastDonationDate;
    private LocalDateTime createdAt;
}
