package com.example.ResQNet.repositories;

import com.example.ResQNet.Models.Emergencycategory;
import com.example.ResQNet.Models.Emergencyrequest;
import com.example.ResQNet.Models.Emergencystatus;
import com.example.ResQNet.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmergencyRequestRepository extends JpaRepository<Emergencyrequest, Long> {

    List<Emergencyrequest> findByRequester(User requester);

    List<Emergencyrequest> findByStatus(Emergencystatus status);

    List<Emergencyrequest> findByCategory(Emergencycategory category);

    List<Emergencyrequest> findByCityIgnoreCaseAndStatus(String city, Emergencystatus status);

    List<Emergencyrequest> findByCategoryAndStatus(Emergencycategory category, Emergencystatus status);
}
