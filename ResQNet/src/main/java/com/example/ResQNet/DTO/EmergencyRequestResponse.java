package com.example.ResQNet.DTO;

import com.example.ResQNet.Models.Emergencycategory;
import com.example.ResQNet.Models.Emergencystatus;
import com.example.ResQNet.Models.Urgencylevel;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EmergencyRequestResponse {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private Emergencycategory category;
    private String description;
    private String city;
    private Double latitude;
    private Double longitude;
    private Urgencylevel urgency;
    private Emergencystatus status;
    private int volunteerCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
