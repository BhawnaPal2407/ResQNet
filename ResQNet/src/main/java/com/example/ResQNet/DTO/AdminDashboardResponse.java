package com.example.ResQNet.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardResponse {

    // Users
    private long totalUsers;
    private long totalAdmins;
    private long totalDonors;
    private long totalVolunteers;
    private long totalNGOs;
    private long totalHospitals;

    // Blood
    private long totalBloodDonors;
    private long availableBloodDonors;
    private long totalBloodRequests;
    private long openBloodRequests;
    private long completedBloodRequests;

    // Emergency
    private long totalEmergencyRequests;
    private long openEmergencyRequests;
    private long resolvedEmergencyRequests;

    // Verification queues
    private long pendingVolunteers;
    private long pendingNGOs;
}
