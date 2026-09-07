package com.example.ResQNet.repositories;

import com.example.ResQNet.Models.User;
import com.example.ResQNet.Models.Verificationstatus;
import com.example.ResQNet.Models.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {

    Optional<Volunteer> findByUser(User user);

    List<Volunteer> findByVerificationStatus(Verificationstatus verificationStatus);

    List<Volunteer> findByAvailableTrueAndVerificationStatus(Verificationstatus verificationStatus);

    List<Volunteer> findByServiceAreaIgnoreCaseAndVerificationStatus(
            String serviceArea, Verificationstatus verificationStatus);

    boolean existsByUser(User user);
}
