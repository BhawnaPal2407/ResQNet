package com.example.ResQNet.Services;

import com.example.ResQNet.DTO.BloodDonorRequest;
import com.example.ResQNet.DTO.BloodDonorResponse;
import com.example.ResQNet.Models.User;
import com.example.ResQNet.Models.bloodDoner;
import com.example.ResQNet.repositories.BloodDonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodDonorService {

    private final BloodDonorRepository bloodDonorRepository;
    private final AuthService authService;

    // ── Register as donor ───────────────────────────────────────────────────
    public BloodDonorResponse registerDonor(String email, BloodDonorRequest request) {
        User user = authService.getUserByEmail(email);

        if (bloodDonorRepository.existsByUser(user)) {
            throw new IllegalStateException("User is already registered as a blood donor");
        }

        bloodDoner donor = bloodDoner.builder()
                .user(user)
                .bloodGroup(request.getBloodGroup())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .lastDonationDate(request.getLastDonationDate())
                .build();

        return toResponse(bloodDonorRepository.save(donor));
    }

    // ── Update donor profile ─────────────────────────────────────────────────
    public BloodDonorResponse updateDonor(String email, BloodDonorRequest request) {
        User user = authService.getUserByEmail(email);
        bloodDoner donor = bloodDonorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found"));

        if (request.getBloodGroup() != null)      donor.setBloodGroup(request.getBloodGroup());
        if (request.getCity() != null)            donor.setCity(request.getCity());
        if (request.getLatitude() != null)        donor.setLatitude(request.getLatitude());
        if (request.getLongitude() != null)       donor.setLongitude(request.getLongitude());
        if (request.getAvailable() != null)       donor.setAvailable(request.getAvailable());
        if (request.getLastDonationDate() != null) donor.setLastDonationDate(request.getLastDonationDate());

        return toResponse(bloodDonorRepository.save(donor));
    }

    // ── Get my donor profile ────────────────────────────────────────────────
    public BloodDonorResponse getMyProfile(String email) {
        User user = authService.getUserByEmail(email);
        bloodDoner donor = bloodDonorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found"));
        return toResponse(donor);
    }

    // ── Search donors ────────────────────────────────────────────────────────
    public List<BloodDonorResponse> searchDonors(String bloodGroup, String city,
                                                  Double lat, Double lng, Double radiusKm) {
        List<bloodDoner> donors;

        if (lat != null && lng != null && radiusKm != null) {
            donors = bloodDonorRepository.findNearbyAvailableDonors(bloodGroup, lat, lng, radiusKm);
        } else if (bloodGroup != null && city != null) {
            donors = bloodDonorRepository.findByBloodGroupAndCityIgnoreCaseAndAvailableTrue(bloodGroup, city);
        } else if (bloodGroup != null) {
            donors = bloodDonorRepository.findByBloodGroupAndAvailableTrue(bloodGroup);
        } else if (city != null) {
            donors = bloodDonorRepository.findByCityIgnoreCaseAndAvailableTrue(city);
        } else {
            donors = bloodDonorRepository.findAll().stream()
                    .filter(bloodDoner::getAvailable)
                    .toList();
        }

        return donors.stream().map(this::toResponse).toList();
    }

    // ── Get donor by id ──────────────────────────────────────────────────────
    public BloodDonorResponse getDonorById(Long id) {
        bloodDoner donor = bloodDonorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found with id: " + id));
        return toResponse(donor);
    }

    // ── Toggle availability ──────────────────────────────────────────────────
    public BloodDonorResponse toggleAvailability(String email) {
        User user = authService.getUserByEmail(email);
        bloodDoner donor = bloodDonorRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Donor profile not found"));
        donor.setAvailable(!donor.getAvailable());
        return toResponse(bloodDonorRepository.save(donor));
    }

    // ── Mapper ───────────────────────────────────────────────────────────────
    private BloodDonorResponse toResponse(bloodDoner donor) {
        return BloodDonorResponse.builder()
                .id(donor.getId())
                .userId(donor.getUser().getId())
                .donorName(donor.getUser().getName())
                .donorPhone(donor.getUser().getPhone())
                .bloodGroup(donor.getBloodGroup())
                .city(donor.getCity())
                .latitude(donor.getLatitude())
                .longitude(donor.getLongitude())
                .available(donor.getAvailable())
                .lastDonationDate(donor.getLastDonationDate())
                .createdAt(donor.getCreatedAt())
                .build();
    }
}
