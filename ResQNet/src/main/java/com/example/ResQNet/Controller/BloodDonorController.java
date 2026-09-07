package com.example.ResQNet.Controller;

import com.example.ResQNet.DTO.BloodDonorRequest;
import com.example.ResQNet.DTO.BloodDonorResponse;
import com.example.ResQNet.Services.BloodDonorService;
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
@RequestMapping("/api/blood-donors")
@RequiredArgsConstructor
public class BloodDonorController {

    private final BloodDonorService bloodDonorService;

    /**
     * POST /api/blood-donors/register
     * Register the current user as a blood donor.
     */
    @PostMapping("/register")
    public ResponseEntity<BloodDonorResponse> register(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BloodDonorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bloodDonorService.registerDonor(userDetails.getUsername(), request));
    }

    /**
     * PUT /api/blood-donors/me
     * Update the current user's donor profile.
     */
    @PutMapping("/me")
    public ResponseEntity<BloodDonorResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BloodDonorRequest request) {
        return ResponseEntity.ok(bloodDonorService.updateDonor(userDetails.getUsername(), request));
    }

    /**
     * GET /api/blood-donors/me
     * Get the current user's donor profile.
     */
    @GetMapping("/me")
    public ResponseEntity<BloodDonorResponse> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bloodDonorService.getMyProfile(userDetails.getUsername()));
    }

    /**
     * GET /api/blood-donors/search
     * Search available donors.
     * Params: bloodGroup, city, lat, lng, radiusKm
     */
    @GetMapping("/search")
    public ResponseEntity<List<BloodDonorResponse>> search(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusKm) {
        return ResponseEntity.ok(bloodDonorService.searchDonors(bloodGroup, city, lat, lng, radiusKm));
    }

    /**
     * GET /api/blood-donors/{id}
     * Get a donor by id.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BloodDonorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bloodDonorService.getDonorById(id));
    }

    /**
     * PATCH /api/blood-donors/me/toggle-availability
     * Toggle the current donor's availability.
     */
    @PatchMapping("/me/toggle-availability")
    public ResponseEntity<BloodDonorResponse> toggleAvailability(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bloodDonorService.toggleAvailability(userDetails.getUsername()));
    }
}
