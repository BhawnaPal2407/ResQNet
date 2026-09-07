package com.example.ResQNet.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BloodDonorRequest {

    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group (e.g. A+, O-, AB+)")
    private String bloodGroup;

    @NotBlank(message = "City is required")
    private String city;

    private Double latitude;
    private Double longitude;

    private Boolean available = true;

    private LocalDate lastDonationDate;
}
