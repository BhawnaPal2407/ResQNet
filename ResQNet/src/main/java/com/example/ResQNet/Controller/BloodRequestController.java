package com.example.ResQNet.Controller;

import com.example.ResQNet.DTO.BloodRequestDTO;
import com.example.ResQNet.DTO.BloodRequestResponse;
import com.example.ResQNet.Models.BloodRequestStatus;
import com.example.ResQNet.Services.BloodRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/blood-requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestService bloodRequestService;

    /**
     * POST /api/blood-requests
     * Create a new blood request.
     */
    @PostMapping
    public ResponseEntity<BloodRequestResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BloodRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bloodRequestService.createRequest(userDetails.getUsername(), dto));
    }

    /**
     * GET /api/blood-requests
     * Get open blood requests. Public endpoint.
     * Params: bloodGroup, city
     */
    @GetMapping
    public ResponseEntity<List<BloodRequestResponse>> getOpenRequests(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(bloodRequestService.getOpenRequests(bloodGroup, city));
    }

    /**
     * GET /api/blood-requests/me
     * Get the current user's blood requests.
     */
    @GetMapping("/me")
    public ResponseEntity<List<BloodRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bloodRequestService.getMyRequests(userDetails.getUsername()));
    }

    /**
     * GET /api/blood-requests/{id}
     * Get a blood request by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BloodRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bloodRequestService.getById(id));
    }

    /**
     * PATCH /api/blood-requests/{id}/status
     * Update request status.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<BloodRequestResponse> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam BloodRequestStatus status) {
        return ResponseEntity.ok(bloodRequestService.updateStatus(userDetails.getUsername(), id, status));
    }

    /**
     * PATCH /api/blood-requests/{id}/match-donor
     * Match a donor to the request.
     */
    @PatchMapping("/{id}/match-donor")
    public ResponseEntity<BloodRequestResponse> matchDonor(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam Long donorId) {
        return ResponseEntity.ok(bloodRequestService.matchDonor(userDetails.getUsername(), id, donorId));
    }

    /**
     * PATCH /api/blood-requests/{id}/cancel
     * Cancel a blood request.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BloodRequestResponse> cancel(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(bloodRequestService.cancelRequest(userDetails.getUsername(), id));
    }
}
