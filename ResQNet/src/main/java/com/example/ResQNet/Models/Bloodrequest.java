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
public class Bloodrequest {
    private Long id;
    private Long requesterId;
    private String bloodGroup;
    private Integer units;
    private String hospitalName;
    private String city;
    private Urgencylevel urgency;
    private BloodRequestStatus status;
    private Long matchedDonorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
