package com.example.ResQNet.Services;

import com.example.ResQNet.DTO.NGORequest;
import com.example.ResQNet.DTO.NGOResponse;
import com.example.ResQNet.Models.*;
import com.example.ResQNet.repositories.NGORepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NGOService {

    private final NGORepository ngoRepository;
    private final AuthService authService;

    // ── Register NGO ──────────────────────────────────────────────────────────
    public NGOResponse registerNGO(String email, NGORequest request) {
        User user = authService.getUserByEmail(email);

        if (ngoRepository.existsByUser(user)) {
            throw new IllegalStateException("User is already registered as an NGO");
        }

        NGO ngo = NGO.builder()
                .user(user)
                .organizationName(request.getOrganizationName())
                .services(request.getServices())
                .serviceArea(request.getServiceArea())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .verificationStatus(Verificationstatus.PENDING)
                .contactName(request.getContactName())
                .contactPhone(request.getContactPhone())
                .build();

        return toResponse(ngoRepository.save(ngo));
    }

    // ── Update NGO ────────────────────────────────────────────────────────────
    public NGOResponse updateNGO(String email, NGORequest request) {
        User user = authService.getUserByEmail(email);
        NGO ngo = ngoRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("NGO profile not found"));

        if (request.getOrganizationName() != null) ngo.setOrganizationName(request.getOrganizationName());
        if (request.getServices() != null)         ngo.setServices(request.getServices());
        if (request.getServiceArea() != null)      ngo.setServiceArea(request.getServiceArea());
        if (request.getAvailable() != null)        ngo.setAvailable(request.getAvailable());
        if (request.getContactName() != null)      ngo.setContactName(request.getContactName());
        if (request.getContactPhone() != null)     ngo.setContactPhone(request.getContactPhone());

        return toResponse(ngoRepository.save(ngo));
    }

    // ── Get my NGO profile ────────────────────────────────────────────────────
    public NGOResponse getMyNGO(String email) {
        User user = authService.getUserByEmail(email);
        return toResponse(ngoRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("NGO profile not found")));
    }

    // ── Get all approved NGOs ─────────────────────────────────────────────────
    public List<NGOResponse> getApprovedNGOs(String serviceArea) {
        List<NGO> ngos = serviceArea != null
                ? ngoRepository.findByServiceAreaIgnoreCaseAndVerificationStatus(serviceArea, Verificationstatus.APPROVED)
                : ngoRepository.findByVerificationStatus(Verificationstatus.APPROVED);
        return ngos.stream().map(this::toResponse).toList();
    }

    // ── Get by id ─────────────────────────────────────────────────────────────
    public NGOResponse getById(Long id) {
        return toResponse(ngoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found: " + id)));
    }

    // ── Admin: verify NGO ─────────────────────────────────────────────────────
    public NGOResponse verifyNGO(Long id, Verificationstatus status) {
        NGO ngo = ngoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found: " + id));
        ngo.setVerificationStatus(status);
        return toResponse(ngoRepository.save(ngo));
    }

    // ── Mapper ────────────────────────────────────────────────────────────────
    private NGOResponse toResponse(NGO ngo) {
        return NGOResponse.builder()
                .id(ngo.getId())
                .userId(ngo.getUser().getId())
                .organizationName(ngo.getOrganizationName())
                .services(ngo.getServices())
                .serviceArea(ngo.getServiceArea())
                .available(ngo.getAvailable())
                .verificationStatus(ngo.getVerificationStatus())
                .contactName(ngo.getContactName())
                .contactPhone(ngo.getContactPhone())
                .createdAt(ngo.getCreatedAt())
                .build();
    }
}
