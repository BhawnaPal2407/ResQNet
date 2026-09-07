package com.example.ResQNet.Services;

import com.example.ResQNet.DTO.BloodRequestDTO;
import com.example.ResQNet.DTO.BloodRequestResponse;
import com.example.ResQNet.Models.*;
import com.example.ResQNet.repositories.BloodDonorRepository;
import com.example.ResQNet.repositories.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final BloodDonorRepository bloodDonorRepository;
    private final AuthService authService;

    // ── Create request ───────────────────────────────────────────────────────
    public BloodRequestResponse createRequest(String email, BloodRequestDTO dto) {
        User requester = authService.getUserByEmail(email);

        Bloodrequest request = Bloodrequest.builder()
                .requester(requester)
                .bloodGroup(dto.getBloodGroup())
                .units(dto.getUnits())
                .hospitalName(dto.getHospitalName())
                .city(dto.getCity())
                .urgency(dto.getUrgency())
                .status(BloodRequestStatus.OPEN)
                .build();

        return toResponse(bloodRequestRepository.save(request));
    }

    // ── Get all open requests ─────────────────────────────────────────────────
    public List<BloodRequestResponse> getOpenRequests(String bloodGroup, String city) {
        List<Bloodrequest> requests;

        if (bloodGroup != null && city != null) {
            requests = bloodRequestRepository.findByBloodGroupAndCityIgnoreCaseAndStatus(
                    bloodGroup, city, BloodRequestStatus.OPEN);
        } else if (bloodGroup != null) {
            requests = bloodRequestRepository.findByBloodGroupAndStatus(bloodGroup, BloodRequestStatus.OPEN);
        } else if (city != null) {
            requests = bloodRequestRepository.findByCityIgnoreCaseAndStatus(city, BloodRequestStatus.OPEN);
        } else {
            requests = bloodRequestRepository.findByStatus(BloodRequestStatus.OPEN);
        }

        return requests.stream().map(this::toResponse).toList();
    }

    // ── Get my requests ───────────────────────────────────────────────────────
    public List<BloodRequestResponse> getMyRequests(String email) {
        User user = authService.getUserByEmail(email);
        return bloodRequestRepository.findByRequester(user)
                .stream().map(this::toResponse).toList();
    }

    // ── Get by id ─────────────────────────────────────────────────────────────
    public BloodRequestResponse getById(Long id) {
        Bloodrequest req = findById(id);
        return toResponse(req);
    }

    // ── Update status ─────────────────────────────────────────────────────────
    public BloodRequestResponse updateStatus(String email, Long id, BloodRequestStatus newStatus) {
        User user = authService.getUserByEmail(email);
        Bloodrequest req = findById(id);

        // Only the requester or an admin can update
        if (!req.getRequester().getId().equals(user.getId())
                && user.getRole() != Role.ADMIN) {
            throw new SecurityException("Not authorized to update this request");
        }

        req.setStatus(newStatus);
        return toResponse(bloodRequestRepository.save(req));
    }

    // ── Match donor to request ────────────────────────────────────────────────
    public BloodRequestResponse matchDonor(String email, Long requestId, Long donorId) {
        User user = authService.getUserByEmail(email);
        Bloodrequest req = findById(requestId);

        if (!req.getRequester().getId().equals(user.getId())
                && user.getRole() != Role.ADMIN) {
            throw new SecurityException("Not authorized to match donor");
        }

        bloodDoner donor = bloodDonorRepository.findById(donorId)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found: " + donorId));

        req.setMatchedDonor(donor);
        req.setStatus(BloodRequestStatus.DONOR_NOTIFIED);
        return toResponse(bloodRequestRepository.save(req));
    }

    // ── Cancel request ────────────────────────────────────────────────────────
    public BloodRequestResponse cancelRequest(String email, Long id) {
        User user = authService.getUserByEmail(email);
        Bloodrequest req = findById(id);

        if (!req.getRequester().getId().equals(user.getId())
                && user.getRole() != Role.ADMIN) {
            throw new SecurityException("Not authorized to cancel this request");
        }

        req.setStatus(BloodRequestStatus.CANCELLED);
        return toResponse(bloodRequestRepository.save(req));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Bloodrequest findById(Long id) {
        return bloodRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blood request not found: " + id));
    }

    private BloodRequestResponse toResponse(Bloodrequest req) {
        return BloodRequestResponse.builder()
                .id(req.getId())
                .requesterId(req.getRequester().getId())
                .requesterName(req.getRequester().getName())
                .bloodGroup(req.getBloodGroup())
                .units(req.getUnits())
                .hospitalName(req.getHospitalName())
                .city(req.getCity())
                .urgency(req.getUrgency())
                .status(req.getStatus())
                .matchedDonorId(req.getMatchedDonor() != null ? req.getMatchedDonor().getId() : null)
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
