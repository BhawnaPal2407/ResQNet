package com.example.ResQNet.Controller;

import com.example.ResQNet.DTO.VolunteerRequest;
import com.example.ResQNet.DTO.VolunteerResponse;
import com.example.ResQNet.Models.Verificationstatus;
import com.example.ResQNet.Services.VolunteerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteers")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerService volunteerService;

    /**
     * POST /api/volunteers/register
     * Register as a volunteer.
     */
    @PostMapping("/register")
    public ResponseEntity<VolunteerResponse> register(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VolunteerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(volunteerService.registerVolunteer(userDetails.getUsername(), request));
    }

    /**
     * PUT /api/volunteers/me
     * Update your volunteer profile.
     */
    @PutMapping("/me")
    public ResponseEntity<VolunteerResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VolunteerRequest request) {
        return ResponseEntity.ok(volunteerService.updateVolunteer(userDetails.getUsername(), request));
    }

    /**
     * GET /api/volunteers/me
     * Get your volunteer profile.
     */
    @GetMapping("/me")
    public ResponseEntity<VolunteerResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(volunteerService.getMyProfile(userDetails.getUsername()));
    }

    /**
     * GET /api/volunteers
     * Get all approved volunteers. Public endpoint.
     * Param: serviceArea (optional)
     */
    @GetMapping
    public ResponseEntity<List<VolunteerResponse>> getApprovedVolunteers(
            @RequestParam(required = false) String serviceArea) {
        return ResponseEntity.ok(volunteerService.getApprovedVolunteers(serviceArea));
    }

    /**
     * GET /api/volunteers/{id}
     * Get a volunteer by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<VolunteerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(volunteerService.getById(id));
    }

    /**
     * PATCH /api/volunteers/{id}/verify
     * Admin-only: approve, reject, or suspend a volunteer.
     */
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VolunteerResponse> verify(
            @PathVariable Long id,
            @RequestParam Verificationstatus status) {
        return ResponseEntity.ok(volunteerService.verifyVolunteer(id, status));
    }

    /**
     * PATCH /api/volunteers/me/toggle-availability
     * Toggle your availability.
     */
    @PatchMapping("/me/toggle-availability")
    public ResponseEntity<VolunteerResponse> toggleAvailability(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(volunteerService.toggleAvailability(userDetails.getUsername()));
    }
}
