package com.example.ResQNet.Services;

import com.example.ResQNet.DTO.VolunteerRequest;
import com.example.ResQNet.DTO.VolunteerResponse;
import com.example.ResQNet.Models.*;
import com.example.ResQNet.repositories.VolunteerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final AuthService authService;

    // ── Register ──────────────────────────────────────────────────────────────
    public VolunteerResponse registerVolunteer(String email, VolunteerRequest request) {
        User user = authService.getUserByEmail(email);

        if (volunteerRepository.existsByUser(user)) {
            throw new IllegalStateException("User is already registered as a volunteer");
        }

        Volunteer volunteer = Volunteer.builder()
                .user(user)
                .organizationName(request.getOrganizationName())
                .services(request.getServices())
                .serviceArea(request.getServiceArea())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .verificationStatus(Verificationstatus.PENDING)
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .build();

        return toResponse(volunteerRepository.save(volunteer));
    }

    // ── Update ────────────────────────────────────────────────────────────────
    public VolunteerResponse updateVolunteer(String email, VolunteerRequest request) {
        User user = authService.getUserByEmail(email);
        Volunteer vol = volunteerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found"));

        if (request.getOrganizationName() != null) vol.setOrganizationName(request.getOrganizationName());
        if (request.getServices() != null)         vol.setServices(request.getServices());
        if (request.getServiceArea() != null)      vol.setServiceArea(request.getServiceArea());
        if (request.getAvailable() != null)        vol.setAvailable(request.getAvailable());
        if (request.getContactName() != null)      vol.setContactName(request.getContactName());
        if (request.getContactPhone() != null)     vol.setContactPhone(request.getContactPhone());

        return toResponse(volunteerRepository.save(vol));
    }

    // ── Get my profile ────────────────────────────────────────────────────────
    public VolunteerResponse getMyProfile(String email) {
        User user = authService.getUserByEmail(email);
        return toResponse(volunteerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found")));
    }

    // ── Get all approved volunteers ───────────────────────────────────────────
    public List<VolunteerResponse> getApprovedVolunteers(String serviceArea) {
        List<Volunteer> volunteers = serviceArea != null
                ? volunteerRepository.findByServiceAreaIgnoreCaseAndVerificationStatus(serviceArea, Verificationstatus.APPROVED)
                : volunteerRepository.findByVerificationStatus(Verificationstatus.APPROVED);
        return volunteers.stream().map(this::toResponse).toList();
    }

    // ── Get by id ─────────────────────────────────────────────────────────────
    public VolunteerResponse getById(Long id) {
        return toResponse(volunteerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer not found: " + id)));
    }

    // ── Admin: verify volunteer ───────────────────────────────────────────────
    public VolunteerResponse verifyVolunteer(Long id, Verificationstatus status) {
        Volunteer vol = volunteerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer not found: " + id));
        vol.setVerificationStatus(status);
        return toResponse(volunteerRepository.save(vol));
    }

    // ── Toggle availability ───────────────────────────────────────────────────
    public VolunteerResponse toggleAvailability(String email) {
        User user = authService.getUserByEmail(email);
        Volunteer vol = volunteerRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer profile not found"));
        vol.setAvailable(!vol.getAvailable());
        return toResponse(volunteerRepository.save(vol));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────
    private VolunteerResponse toResponse(Volunteer vol) {
        return VolunteerResponse.builder()
                .id(vol.getId())
                .userId(vol.getUser().getId())
                .volunteerName(vol.getUser().getName())
                .organizationName(vol.getOrganizationName())
                .services(vol.getServices())
                .serviceArea(vol.getServiceArea())
                .available(vol.getAvailable())
                .verificationStatus(vol.getVerificationStatus())
                .contactName(vol.getContactName())
                .contactPhone(vol.getContactPhone())
                .createdAt(vol.getCreatedAt())
                .build();
    }
}
