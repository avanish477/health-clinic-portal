package com.clinic.clinic_backend.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String role; // "patient" or "doctor"
    
    // Doctor specific info
    private String specialization;
    private String description;
}
