package com.clinic.clinic_backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", referencedColumnName = "id", nullable = false)
    private Appointment appointment;

    @Column(nullable = false, length = 1000)
    private String diagnosis;

    @Column(nullable = false, length = 2000)
    private String medications; // Text list, e.g. "Aspirin 100mg - 1 daily"

    @Column(name = "dosage_instructions", length = 2000)
    private String dosageInstructions;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;
}
