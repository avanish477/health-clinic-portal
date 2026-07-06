package com.clinic.clinic_backend.controller;

import com.clinic.clinic_backend.dto.AppointmentRequest;
import com.clinic.clinic_backend.model.Appointment;
import com.clinic.clinic_backend.model.DoctorProfile;
import com.clinic.clinic_backend.model.User;
import com.clinic.clinic_backend.repository.AppointmentRepository;
import com.clinic.clinic_backend.repository.DoctorProfileRepository;
import com.clinic.clinic_backend.repository.UserRepository;
import com.clinic.clinic_backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    DoctorProfileRepository doctorProfileRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User patient = userRepository.findById(userDetails.getId()).orElse(null);
        if (patient == null) {
            return ResponseEntity.badRequest().body("Error: Patient not found!");
        }

        DoctorProfile doctorProfile = doctorProfileRepository.findById(request.getDoctorProfileId()).orElse(null);
        if (doctorProfile == null) {
            return ResponseEntity.badRequest().body("Error: Doctor not found!");
        }

        List<Appointment> existing = appointmentRepository.findByDoctorProfileIdAndAppointmentDate(
                request.getDoctorProfileId(), request.getAppointmentDate());
        
        boolean isSlotTaken = existing.stream().anyMatch(app -> 
                app.getTimeSlot().equalsIgnoreCase(request.getTimeSlot()) && 
                !"CANCELLED".equalsIgnoreCase(app.getStatus()));

        if (isSlotTaken) {
            return ResponseEntity.badRequest().body("Error: This slot is already booked!");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctorProfile(doctorProfile)
                .appointmentDate(request.getAppointmentDate())
                .timeSlot(request.getTimeSlot())
                .status("SCHEDULED")
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<Appointment>> getPatientAppointments() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(appointmentRepository.findByPatientId(userDetails.getId()));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<Appointment>> getDoctorAppointments() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        DoctorProfile doctorProfile = doctorProfileRepository.findByUserId(userDetails.getId()).orElse(null);
        if (doctorProfile == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentRepository.findByDoctorProfileId(doctorProfile.getId()));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Appointment appointment = appointmentOpt.get();
        appointment.setStatus(status.toUpperCase());
        appointmentRepository.save(appointment);
        return ResponseEntity.ok("Appointment status updated successfully!");
    }
}
