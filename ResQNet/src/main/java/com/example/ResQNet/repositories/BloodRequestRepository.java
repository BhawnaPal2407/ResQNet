package com.example.ResQNet.repositories;

import com.example.ResQNet.Models.BloodRequestStatus;
import com.example.ResQNet.Models.Bloodrequest;
import com.example.ResQNet.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodRequestRepository extends JpaRepository<Bloodrequest, Long> {

    List<Bloodrequest> findByRequester(User requester);

    List<Bloodrequest> findByStatus(BloodRequestStatus status);

    List<Bloodrequest> findByCityIgnoreCaseAndStatus(String city, BloodRequestStatus status);

    List<Bloodrequest> findByBloodGroupAndStatus(String bloodGroup, BloodRequestStatus status);

    List<Bloodrequest> findByBloodGroupAndCityIgnoreCaseAndStatus(
            String bloodGroup, String city, BloodRequestStatus status);
}
