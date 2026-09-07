package com.example.ResQNet.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NGORequest {

    @NotBlank(message = "Organization name is required")
    private String organizationName;

    private String services;
    private String serviceArea;
    private Boolean available = true;
    private String contactName;
    private String contactPhone;
}
