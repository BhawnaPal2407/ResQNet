package com.example.ResQNet.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class bloodDoner {
    private Long id;
    private Long userId;
    private String bloodGroup;
    private String city;
    private Double latitude;
    private Double longitude;
    private Boolean available;
    private LocalDate lastDonationDate;
    private LocalDateTime createdAt;


    private String donorName;
    private String donorPhone;
}
