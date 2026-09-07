package com.example.ResQNet.Services;

import com.example.ResQNet.DTO.EmergencyRequestDTO;
import com.example.ResQNet.DTO.EmergencyRequestResponse;
import com.example.ResQNet.Models.*;
import com.example.ResQNet.repositories.EmergencyRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmergencyRequestService {

    private final EmergencyRequestRepository emergencyRequestRepository;
    private final AuthService authService;

    // ── Create ────────────────────────────────────────────────────────────────
    public EmergencyRequestResponse createRequest(String email, EmergencyRequestDTO dto) {
        User requester = authService.getUserByEmail(email);

        Emergencyrequest request = Emergencyrequest.builder()
                .requester(requester)
                .category(dto.getCategory())
                .description(dto.getDescription())
                .city(dto.getCity())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .urgency(dto.getUrgency())
                .status(Emergencystatus.OPEN)
                .build();

        return toResponse(emergencyRequestRepository.save(request));
    }

    // ── Get all (optionally filter) ───────────────────────────────────────────
    public List<EmergencyRequestResponse> getRequests(String city, String category, String status) {
        Emergencystatus statusEnum = status != null ? Emergencystatus.valueOf(status.toUpperCase()) : null;
        Emergencycategory categoryEnum = category != null ? Emergencycategory.valueOf(category.toUpperCase()) : null;

        List<Emergencyrequest> result;

        if (city != null && statusEnum != null) {
            result = emergencyRequestRepository.findByCityIgnoreCaseAndStatus(city, statusEnum);
        } else if (categoryEnum != null && statusEnum != null) {
            result = emergencyRequestRepository.findByCategoryAndStatus(categoryEnum, statusEnum);
        } else if (statusEnum != null) {
            result = emergencyRequestRepository.findByStatus(statusEnum);
        } else if (categoryEnum != null) {
            result = emergencyRequestRepository.findByCategory(categoryEnum);
        } else {
            result = emergencyRequestRepository.findByStatus(Emergencystatus.OPEN);
        }

        return result.stream().map(this::toResponse).toList();
    }

    // ── Get my requests ───────────────────────────────────────────────────────
    public List<EmergencyRequestResponse> getMyRequests(String email) {
        User user = authService.getUserByEmail(email);
        return emergencyRequestRepository.findByRequester(user)
                .stream().map(this::toResponse).toList();
    }

    // ── Get by id ─────────────────────────────────────────────────────────────
    public EmergencyRequestResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // ── Update status ─────────────────────────────────────────────────────────
    public EmergencyRequestResponse updateStatus(String email, Long id, Emergencystatus newStatus) {
        User user = authService.getUserByEmail(email);
        Emergencyrequest req = findById(id);

        if (!req.getRequester().getId().equals(user.getId())
                && user.getRole() != Role.ADMIN) {
            throw new SecurityException("Not authorized to update this request");
        }

        req.setStatus(newStatus);
        return toResponse(emergencyRequestRepository.save(req));
    }

    // ── Respond (volunteer) ───────────────────────────────────────────────────
    public EmergencyRequestResponse respondToRequest(Long id) {
        Emergencyrequest req = findById(id);

        if (req.getStatus() != Emergencystatus.OPEN) {
            throw new IllegalStateException("Cannot respond to a request that is not OPEN");
        }

        req.setVolunteerCount(req.getVolunteerCount() + 1);
        return toResponse(emergencyRequestRepository.save(req));
    }

    // ── Cancel ────────────────────────────────────────────────────────────────
    public EmergencyRequestResponse cancelRequest(String email, Long id) {
        return updateStatus(email, id, Emergencystatus.CANCELLED);
    }

    // ── Resolve ───────────────────────────────────────────────────────────────
    public EmergencyRequestResponse resolveRequest(String email, Long id) {
        return updateStatus(email, id, Emergencystatus.RESOLVED);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Emergencyrequest findById(Long id) {
        return emergencyRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emergency request not found: " + id));
    }

    private EmergencyRequestResponse toResponse(Emergencyrequest req) {
        return EmergencyRequestResponse.builder()
                .id(req.getId())
                .requesterId(req.getRequester().getId())
                .requesterName(req.getRequester().getName())
                .category(req.getCategory())
                .description(req.getDescription())
                .city(req.getCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .urgency(req.getUrgency())
                .status(req.getStatus())
                .volunteerCount(req.getVolunteerCount())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }
}
