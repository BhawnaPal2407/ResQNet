package com.example.ResQNet.DTO;

import com.example.ResQNet.Models.Emergencycategory;
import com.example.ResQNet.Models.Emergencystatus;
import com.example.ResQNet.Models.Urgencylevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmergencyRequestDTO {

    @NotNull(message = "Category is required")
    private Emergencycategory category;

    private String description;

    @NotBlank(message = "City is required")
    private String city;

    private Double latitude;
    private Double longitude;

    @NotNull(message = "Urgency level is required")
    private Urgencylevel urgency;

    // Used in update/response only
    private Emergencystatus status;
}
