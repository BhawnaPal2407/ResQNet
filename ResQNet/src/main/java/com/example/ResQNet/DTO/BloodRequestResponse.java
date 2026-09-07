package com.example.ResQNet.DTO;

import com.example.ResQNet.Models.BloodRequestStatus;
import com.example.ResQNet.Models.Urgencylevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BloodRequestResponse {
    private Long id;
    private Long requesterId;
    private String requesterName;
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
