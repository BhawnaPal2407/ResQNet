package com.example.ResQNet.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VolunteerRequest {

    private String organizationName;

    @NotBlank(message = "Services offered is required")
    private String services;

    private String serviceArea;
    private Boolean available = true;
    private String contactName;
    private String contactPhone;
}
