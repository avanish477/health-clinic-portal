package com.clinic.clinic_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AppointmentRequest {
    private Long doctorProfileId;
    private LocalDate appointmentDate;
    private String timeSlot;
}
