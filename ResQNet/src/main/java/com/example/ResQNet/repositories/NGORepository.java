package com.example.ResQNet.repositories;

import com.example.ResQNet.Models.NGO;
import com.example.ResQNet.Models.User;
import com.example.ResQNet.Models.Verificationstatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NGORepository extends JpaRepository<NGO, Long> {

    Optional<NGO> findByUser(User user);

    List<NGO> findByVerificationStatus(Verificationstatus verificationStatus);

    List<NGO> findByAvailableTrueAndVerificationStatus(Verificationstatus verificationStatus);

    List<NGO> findByServiceAreaIgnoreCaseAndVerificationStatus(
            String serviceArea, Verificationstatus verificationStatus);

    boolean existsByUser(User user);
}
