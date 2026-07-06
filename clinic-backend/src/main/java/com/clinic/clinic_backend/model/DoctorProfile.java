package com.clinic.clinic_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String specialization;

    private Double rating;

    @Column(length = 1000)
    private String description;

    @Column(name = "available_slots", length = 1000)
    private String availableSlots; // Semicolon separated, e.g., "09:00 AM;10:00 AM;02:00 PM"
}
