package com.example.ResQNet.Services;

import com.example.ResQNet.DTO.*;
import com.example.ResQNet.Models.*;
import com.example.ResQNet.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BloodDonorRepository bloodDonorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final VolunteerRepository volunteerRepository;
    private final NGORepository ngoRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        List<User> allUsers = userRepository.findAll();

        return AdminDashboardResponse.builder()
                // Users by role
                .totalUsers(allUsers.size())
                .totalAdmins(allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count())
                .totalDonors(allUsers.stream().filter(u -> u.getRole() == Role.DONOR).count())
                .totalVolunteers(allUsers.stream().filter(u -> u.getRole() == Role.VOLUNTEER).count())
                .totalNGOs(allUsers.stream().filter(u -> u.getRole() == Role.NGO).count())
                .totalHospitals(allUsers.stream().filter(u -> u.getRole() == Role.HOSPITAL).count())

                // Blood
                .totalBloodDonors(bloodDonorRepository.count())
                .availableBloodDonors(bloodDonorRepository.findAll().stream()
                        .filter(bloodDoner::getAvailable).count())
                .totalBloodRequests(bloodRequestRepository.count())
                .openBloodRequests(bloodRequestRepository.findByStatus(BloodRequestStatus.OPEN).size())
                .completedBloodRequests(bloodRequestRepository.findByStatus(BloodRequestStatus.COMPLETED).size())

                // Emergency
                .totalEmergencyRequests(emergencyRequestRepository.count())
                .openEmergencyRequests(emergencyRequestRepository.findByStatus(Emergencystatus.OPEN).size())
                .resolvedEmergencyRequests(emergencyRequestRepository.findByStatus(Emergencystatus.RESOLVED).size())

                // Verification queues
                .pendingVolunteers(volunteerRepository.findByVerificationStatus(Verificationstatus.PENDING).size())
                .pendingNGOs(ngoRepository.findByVerificationStatus(Verificationstatus.PENDING).size())
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == role)
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return toUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserRole(Long id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setRole(newRole);
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BLOOD DONOR MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BloodDonorResponse> getAllBloodDonors() {
        return bloodDonorRepository.findAll().stream()
                .map(this::toBloodDonorResponse)
                .toList();
    }

    @Transactional
    public void deleteBloodDonor(Long id) {
        if (!bloodDonorRepository.existsById(id)) {
            throw new IllegalArgumentException("Blood donor not found: " + id);
        }
        bloodDonorRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BLOOD REQUEST MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BloodRequestResponse> getAllBloodRequests() {
        return bloodRequestRepository.findAll().stream()
                .map(this::toBloodRequestResponse)
                .toList();
    }

    @Transactional
    public BloodRequestResponse updateBloodRequestStatus(Long id, BloodRequestStatus newStatus) {
        Bloodrequest req = bloodRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Blood request not found: " + id));
        req.setStatus(newStatus);
        return toBloodRequestResponse(bloodRequestRepository.save(req));
    }

    @Transactional
    public void deleteBloodRequest(Long id) {
        if (!bloodRequestRepository.existsById(id)) {
            throw new IllegalArgumentException("Blood request not found: " + id);
        }
        bloodRequestRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EMERGENCY REQUEST MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EmergencyRequestResponse> getAllEmergencyRequests() {
        return emergencyRequestRepository.findAll().stream()
                .map(this::toEmergencyResponse)
                .toList();
    }

    @Transactional
    public EmergencyRequestResponse updateEmergencyStatus(Long id, Emergencystatus newStatus) {
        Emergencyrequest req = emergencyRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emergency request not found: " + id));
        req.setStatus(newStatus);
        return toEmergencyResponse(emergencyRequestRepository.save(req));
    }

    @Transactional
    public void deleteEmergencyRequest(Long id) {
        if (!emergencyRequestRepository.existsById(id)) {
            throw new IllegalArgumentException("Emergency request not found: " + id);
        }
        emergencyRequestRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VOLUNTEER MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VolunteerResponse> getAllVolunteers() {
        return volunteerRepository.findAll().stream()
                .map(this::toVolunteerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VolunteerResponse> getPendingVolunteers() {
        return volunteerRepository.findByVerificationStatus(Verificationstatus.PENDING).stream()
                .map(this::toVolunteerResponse)
                .toList();
    }

    @Transactional
    public VolunteerResponse verifyVolunteer(Long id, Verificationstatus status) {
        Volunteer vol = volunteerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Volunteer not found: " + id));
        vol.setVerificationStatus(status);
        return toVolunteerResponse(volunteerRepository.save(vol));
    }

    @Transactional
    public void deleteVolunteer(Long id) {
        if (!volunteerRepository.existsById(id)) {
            throw new IllegalArgumentException("Volunteer not found: " + id);
        }
        volunteerRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NGO MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NGOResponse> getAllNGOs() {
        return ngoRepository.findAll().stream()
                .map(this::toNGOResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NGOResponse> getPendingNGOs() {
        return ngoRepository.findByVerificationStatus(Verificationstatus.PENDING).stream()
                .map(this::toNGOResponse)
                .toList();
    }

    @Transactional
    public NGOResponse verifyNGO(Long id, Verificationstatus status) {
        NGO ngo = ngoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("NGO not found: " + id));
        ngo.setVerificationStatus(status);
        return toNGOResponse(ngoRepository.save(ngo));
    }

    @Transactional
    public void deleteNGO(Long id) {
        if (!ngoRepository.existsById(id)) {
            throw new IllegalArgumentException("NGO not found: " + id);
        }
        ngoRepository.deleteById(id);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAPPERS
    // ─────────────────────────────────────────────────────────────────────────

    private AdminUserResponse toUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private BloodDonorResponse toBloodDonorResponse(bloodDoner donor) {
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

    private BloodRequestResponse toBloodRequestResponse(Bloodrequest req) {
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

    private EmergencyRequestResponse toEmergencyResponse(Emergencyrequest req) {
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
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }

    private VolunteerResponse toVolunteerResponse(Volunteer vol) {
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

    private NGOResponse toNGOResponse(NGO ngo) {
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
