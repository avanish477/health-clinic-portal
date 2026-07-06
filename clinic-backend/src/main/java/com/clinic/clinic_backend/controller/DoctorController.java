package com.clinic.clinic_backend.controller;

import com.clinic.clinic_backend.model.DoctorProfile;
import com.clinic.clinic_backend.repository.DoctorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    DoctorProfileRepository doctorProfileRepository;

    @GetMapping("/search")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DoctorProfile>> searchDoctors(@RequestParam(required = false) String specialization) {
        if (specialization != null && !specialization.trim().isEmpty()) {
            return ResponseEntity.ok(doctorProfileRepository.findBySpecializationContainingIgnoreCase(specialization));
        }
        return ResponseEntity.ok(doctorProfileRepository.findAll());
    }

    @GetMapping("/profile/{userId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<?> getDoctorProfile(@PathVariable Long userId) {
        return doctorProfileRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
