package com.example.ResQNet.Controller;

import com.example.ResQNet.DTO.*;
import com.example.ResQNet.Models.*;
import com.example.ResQNet.Services.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin-only endpoints. All routes require ROLE_ADMIN.
 * Base path: /api/admin
 */
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    /**
     * GET /api/admin/dashboard
     * Returns aggregated platform statistics.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // =========================================================================
    // USER MANAGEMENT
    // =========================================================================

    /**
     * GET /api/admin/users
     * List all users. Optional filter: ?role=DONOR
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(
            @RequestParam(required = false) Role role) {
        if (role != null) {
            return ResponseEntity.ok(adminService.getUsersByRole(role));
        }
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * GET /api/admin/users/{id}
     * Get a single user by id.
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    /**
     * PATCH /api/admin/users/{id}/role
     * Change a user's role.
     * Body: { "role": "VOLUNTEER" }
     */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole()));
    }

    /**
     * DELETE /api/admin/users/{id}
     * Permanently delete a user account.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // BLOOD DONOR MANAGEMENT
    // =========================================================================

    /**
     * GET /api/admin/blood-donors
     * List all blood donor profiles.
     */
    @GetMapping("/blood-donors")
    public ResponseEntity<List<BloodDonorResponse>> getAllBloodDonors() {
        return ResponseEntity.ok(adminService.getAllBloodDonors());
    }

    /**
     * DELETE /api/admin/blood-donors/{id}
     * Remove a blood donor profile.
     */
    @DeleteMapping("/blood-donors/{id}")
    public ResponseEntity<Void> deleteBloodDonor(@PathVariable Long id) {
        adminService.deleteBloodDonor(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // BLOOD REQUEST MANAGEMENT
    // =========================================================================

    /**
     * GET /api/admin/blood-requests
     * List all blood requests across all statuses.
     */
    @GetMapping("/blood-requests")
    public ResponseEntity<List<BloodRequestResponse>> getAllBloodRequests() {
        return ResponseEntity.ok(adminService.getAllBloodRequests());
    }

    /**
     * PATCH /api/admin/blood-requests/{id}/status
     * Override a blood request status.
     * Param: ?status=COMPLETED
     */
    @PatchMapping("/blood-requests/{id}/status")
    public ResponseEntity<BloodRequestResponse> updateBloodRequestStatus(
            @PathVariable Long id,
            @RequestParam BloodRequestStatus status) {
        return ResponseEntity.ok(adminService.updateBloodRequestStatus(id, status));
    }

    /**
     * DELETE /api/admin/blood-requests/{id}
     * Delete a blood request.
     */
    @DeleteMapping("/blood-requests/{id}")
    public ResponseEntity<Void> deleteBloodRequest(@PathVariable Long id) {
        adminService.deleteBloodRequest(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // EMERGENCY REQUEST MANAGEMENT
    // =========================================================================

    /**
     * GET /api/admin/emergency-requests
     * List all emergency requests across all statuses.
     */
    @GetMapping("/emergency-requests")
    public ResponseEntity<List<EmergencyRequestResponse>> getAllEmergencyRequests() {
        return ResponseEntity.ok(adminService.getAllEmergencyRequests());
    }

    /**
     * PATCH /api/admin/emergency-requests/{id}/status
     * Override an emergency request status.
     * Param: ?status=RESOLVED
     */
    @PatchMapping("/emergency-requests/{id}/status")
    public ResponseEntity<EmergencyRequestResponse> updateEmergencyStatus(
            @PathVariable Long id,
            @RequestParam Emergencystatus status) {
        return ResponseEntity.ok(adminService.updateEmergencyStatus(id, status));
    }

    /**
     * DELETE /api/admin/emergency-requests/{id}
     * Delete an emergency request.
     */
    @DeleteMapping("/emergency-requests/{id}")
    public ResponseEntity<Void> deleteEmergencyRequest(@PathVariable Long id) {
        adminService.deleteEmergencyRequest(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // VOLUNTEER MANAGEMENT
    // =========================================================================

    /**
     * GET /api/admin/volunteers
     * List all volunteer profiles.
     */
    @GetMapping("/volunteers")
    public ResponseEntity<List<VolunteerResponse>> getAllVolunteers() {
        return ResponseEntity.ok(adminService.getAllVolunteers());
    }

    /**
     * GET /api/admin/volunteers/pending
     * List volunteers awaiting verification.
     */
    @GetMapping("/volunteers/pending")
    public ResponseEntity<List<VolunteerResponse>> getPendingVolunteers() {
        return ResponseEntity.ok(adminService.getPendingVolunteers());
    }

    /**
     * PATCH /api/admin/volunteers/{id}/verify
     * Approve, reject, or suspend a volunteer.
     * Param: ?status=APPROVED
     */
    @PatchMapping("/volunteers/{id}/verify")
    public ResponseEntity<VolunteerResponse> verifyVolunteer(
            @PathVariable Long id,
            @RequestParam Verificationstatus status) {
        return ResponseEntity.ok(adminService.verifyVolunteer(id, status));
    }

    /**
     * DELETE /api/admin/volunteers/{id}
     * Delete a volunteer profile.
     */
    @DeleteMapping("/volunteers/{id}")
    public ResponseEntity<Void> deleteVolunteer(@PathVariable Long id) {
        adminService.deleteVolunteer(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // NGO MANAGEMENT
    // =========================================================================

    /**
     * GET /api/admin/ngos
     * List all NGO profiles.
     */
    @GetMapping("/ngos")
    public ResponseEntity<List<NGOResponse>> getAllNGOs() {
        return ResponseEntity.ok(adminService.getAllNGOs());
    }

    /**
     * GET /api/admin/ngos/pending
     * List NGOs awaiting verification.
     */
    @GetMapping("/ngos/pending")
    public ResponseEntity<List<NGOResponse>> getPendingNGOs() {
        return ResponseEntity.ok(adminService.getPendingNGOs());
    }

    /**
     * PATCH /api/admin/ngos/{id}/verify
     * Approve, reject, or suspend an NGO.
     * Param: ?status=APPROVED
     */
    @PatchMapping("/ngos/{id}/verify")
    public ResponseEntity<NGOResponse> verifyNGO(
            @PathVariable Long id,
            @RequestParam Verificationstatus status) {
        return ResponseEntity.ok(adminService.verifyNGO(id, status));
    }

    /**
     * DELETE /api/admin/ngos/{id}
     * Delete an NGO profile.
     */
    @DeleteMapping("/ngos/{id}")
    public ResponseEntity<Void> deleteNGO(@PathVariable Long id) {
        adminService.deleteNGO(id);
        return ResponseEntity.noContent().build();
    }
}
