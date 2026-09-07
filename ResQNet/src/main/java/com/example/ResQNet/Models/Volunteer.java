package com.example.ResQNet.Models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "volunteers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "organization_name")
    private String organizationName;

    @Column(columnDefinition = "TEXT")
    private String services;

    @Column(name = "service_area")
    private String serviceArea;

    @Column(nullable = false)
    private Boolean available;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private Verificationstatus verificationStatus;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.available == null) this.available = true;
        if (this.verificationStatus == null) this.verificationStatus = Verificationstatus.PENDING;
    }
}
