package com.example.ResQNet.repositories;

import com.example.ResQNet.Models.bloodDoner;
import com.example.ResQNet.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloodDonorRepository extends JpaRepository<bloodDoner, Long> {

    Optional<bloodDoner> findByUser(User user);

    List<bloodDoner> findByBloodGroupAndAvailableTrue(String bloodGroup);

    List<bloodDoner> findByCityIgnoreCaseAndAvailableTrue(String city);

    List<bloodDoner> findByBloodGroupAndCityIgnoreCaseAndAvailableTrue(String bloodGroup, String city);

    boolean existsByUser(User user);

    /** Find donors within a radius (km) using the Haversine formula */
    @Query("""
            SELECT d FROM bloodDoner d
            WHERE d.available = true
              AND d.bloodGroup = :bloodGroup
              AND (6371 * acos(
                    cos(radians(:lat)) * cos(radians(d.latitude)) *
                    cos(radians(d.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(d.latitude))
                  )) <= :radiusKm
            """)
    List<bloodDoner> findNearbyAvailableDonors(
            @Param("bloodGroup") String bloodGroup,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm);
}
