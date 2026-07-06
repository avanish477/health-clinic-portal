package com.clinic.clinic_backend.dto;

import lombok.Data;

@Data
public class PrescriptionRequest {
    private String diagnosis;
    private String medications;
    private String dosageInstructions;
}
