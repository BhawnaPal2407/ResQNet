package com.example.ResQNet.Models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Emergencyrequest {
    private Long id;
    private Long requesterId;
    private Emergencycategory category;
    private String description;
    private String city;
    private Double latitude;
    private Double longitude;
    private Urgencylevel urgency;
    private Emergencystatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
