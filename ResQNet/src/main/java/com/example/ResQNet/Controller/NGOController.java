package com.example.ResQNet.Controller;

import com.example.ResQNet.DTO.NGORequest;
import com.example.ResQNet.DTO.NGOResponse;
import com.example.ResQNet.Models.Verificationstatus;
import com.example.ResQNet.Services.NGOService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class NGOController {

    private final NGOService ngoService;

    /**
     * POST /api/ngos/register
     * Register as an NGO.
     */
    @PostMapping("/register")
    public ResponseEntity<NGOResponse> register(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NGORequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ngoService.registerNGO(userDetails.getUsername(), request));
    }

    /**
     * PUT /api/ngos/me
     * Update your NGO profile.
     */
    @PutMapping("/me")
    public ResponseEntity<NGOResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody NGORequest request) {
        return ResponseEntity.ok(ngoService.updateNGO(userDetails.getUsername(), request));
    }

    /**
     * GET /api/ngos/me
     * Get your NGO profile.
     */
    @GetMapping("/me")
    public ResponseEntity<NGOResponse> getMyNGO(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ngoService.getMyNGO(userDetails.getUsername()));
    }

    /**
     * GET /api/ngos
     * Get all approved NGOs. Public endpoint.
     * Param: serviceArea (optional)
     */
    @GetMapping
    public ResponseEntity<List<NGOResponse>> getApprovedNGOs(
            @RequestParam(required = false) String serviceArea) {
        return ResponseEntity.ok(ngoService.getApprovedNGOs(serviceArea));
    }

    /**
     * GET /api/ngos/{id}
     * Get NGO by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<NGOResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ngoService.getById(id));
    }

    /**
     * PATCH /api/ngos/{id}/verify
     * Admin-only: approve, reject, or suspend an NGO.
     */
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NGOResponse> verify(
            @PathVariable Long id,
            @RequestParam Verificationstatus status) {
        return ResponseEntity.ok(ngoService.verifyNGO(id, status));
    }
}
