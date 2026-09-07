package com.example.ResQNet.Controller;

import com.example.ResQNet.DTO.EmergencyRequestDTO;
import com.example.ResQNet.DTO.EmergencyRequestResponse;
import com.example.ResQNet.Models.Emergencystatus;
import com.example.ResQNet.Services.EmergencyRequestService;
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
@RequestMapping("/api/emergency-requests")
@RequiredArgsConstructor
public class EmergencyRequestController {

    private final EmergencyRequestService emergencyRequestService;

    /**
     * POST /api/emergency-requests
     * Report a new emergency.
     */
    @PostMapping
    public ResponseEntity<EmergencyRequestResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody EmergencyRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(emergencyRequestService.createRequest(userDetails.getUsername(), dto));
    }

    /**
     * GET /api/emergency-requests
     * Get emergency requests. Public endpoint.
     * Params: city, category, status (defaults to OPEN)
     */
    @GetMapping
    public ResponseEntity<List<EmergencyRequestResponse>> getRequests(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(emergencyRequestService.getRequests(city, category, status));
    }

    /**
     * GET /api/emergency-requests/me
     * Get the current user's emergency requests.
     */
    @GetMapping("/me")
    public ResponseEntity<List<EmergencyRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(emergencyRequestService.getMyRequests(userDetails.getUsername()));
    }

    /**
     * GET /api/emergency-requests/{id}
     * Get an emergency request by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmergencyRequestResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(emergencyRequestService.getById(id));
    }

    /**
     * POST /api/emergency-requests/{id}/respond
     * Any authenticated user (volunteer) signals they are responding to this request.
     * Increments the volunteerCount and returns the updated request.
     */
    @PostMapping("/{id}/respond")
    public ResponseEntity<EmergencyRequestResponse> respond(
            @PathVariable Long id) {
        return ResponseEntity.ok(emergencyRequestService.respondToRequest(id));
    }

    /**
     * PATCH /api/emergency-requests/{id}/status
     * Update the status.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<EmergencyRequestResponse> updateStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam Emergencystatus status) {
        return ResponseEntity.ok(emergencyRequestService.updateStatus(userDetails.getUsername(), id, status));
    }

    /**
     * PATCH /api/emergency-requests/{id}/cancel
     * Cancel an emergency request.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<EmergencyRequestResponse> cancel(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(emergencyRequestService.cancelRequest(userDetails.getUsername(), id));
    }

    /**
     * PATCH /api/emergency-requests/{id}/resolve
     * Mark an emergency request as resolved.
     */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<EmergencyRequestResponse> resolve(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(emergencyRequestService.resolveRequest(userDetails.getUsername(), id));
    }
}
