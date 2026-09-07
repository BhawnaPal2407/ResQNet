package com.example.ResQNet.DTO;

import com.example.ResQNet.Models.BloodRequestStatus;
import com.example.ResQNet.Models.Urgencylevel;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BloodRequestDTO {

    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group (e.g. A+, O-, AB+)")
    private String bloodGroup;

    @NotNull(message = "Units required is required")
    @Min(value = 1, message = "At least 1 unit required")
    private Integer units;

    private String hospitalName;

    @NotBlank(message = "City is required")
    private String city;

    @NotNull(message = "Urgency level is required")
    private Urgencylevel urgency;

    // Used in update/response only
    private BloodRequestStatus status;
    private Long matchedDonorId;
}
