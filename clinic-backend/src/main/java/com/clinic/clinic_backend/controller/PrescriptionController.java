package com.clinic.clinic_backend.controller;

import com.clinic.clinic_backend.dto.PrescriptionRequest;
import com.clinic.clinic_backend.model.Appointment;
import com.clinic.clinic_backend.model.Prescription;
import com.clinic.clinic_backend.repository.AppointmentRepository;
import com.clinic.clinic_backend.repository.PrescriptionRepository;
import com.clinic.clinic_backend.service.PdfGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    PrescriptionRepository prescriptionRepository;

    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    PdfGenerationService pdfGenerationService;

    @PostMapping("/write/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> writePrescription(@PathVariable Long appointmentId, @RequestBody PrescriptionRequest request) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Appointment not found!");
        }

        Appointment appointment = appointmentOpt.get();
        
        // Save the prescription
        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .diagnosis(request.getDiagnosis())
                .medications(request.getMedications())
                .dosageInstructions(request.getDosageInstructions())
                .createdDate(LocalDate.now())
                .build();

        Prescription saved = prescriptionRepository.save(prescription);

        // Mark appointment as COMPLETED
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<?> getPrescriptionByAppointment(@PathVariable Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<?> getPrescriptionsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionRepository.findByAppointmentPatientId(patientId));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ResponseEntity<InputStreamResource> downloadPrescriptionPdf(@PathVariable Long id) {
        Optional<Prescription> prescriptionOpt = prescriptionRepository.findById(id);
        if (prescriptionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Prescription prescription = prescriptionOpt.get();
        ByteArrayInputStream bis = pdfGenerationService.generatePrescriptionPdf(prescription);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=prescription-" + id + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
