package com.clinic.clinic_backend.config;

import com.clinic.clinic_backend.model.DoctorProfile;
import com.clinic.clinic_backend.model.Role;
import com.clinic.clinic_backend.model.User;
import com.clinic.clinic_backend.repository.DoctorProfileRepository;
import com.clinic.clinic_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    DoctorProfileRepository doctorProfileRepository;

    @Autowired
    PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed a patient
            User patient = User.builder()
                    .username("patient")
                    .password(encoder.encode("patient"))
                    .email("patient@gmail.com")
                    .firstName("John")
                    .lastName("Doe")
                    .role(Role.ROLE_PATIENT)
                    .build();
            userRepository.save(patient);

            // Seed Doctor 1 (Cardiologist)
            User docUser1 = User.builder()
                    .username("doctor1")
                    .password(encoder.encode("doctor"))
                    .email("sarah@clinic.com")
                    .firstName("Sarah")
                    .lastName("Connor")
                    .role(Role.ROLE_DOCTOR)
                    .build();
            User savedDoc1 = userRepository.save(docUser1);

            DoctorProfile docProfile1 = DoctorProfile.builder()
                    .user(savedDoc1)
                    .specialization("Cardiologist")
                    .rating(4.9)
                    .description("Specialist in heart disease, cardiovascular health, and preventative care with over 12 years of experience.")
                    .availableSlots("09:00 AM;10:00 AM;11:00 AM;02:00 PM;03:00 PM")
                    .build();
            doctorProfileRepository.save(docProfile1);

            // Seed Doctor 2 (Pediatrician)
            User docUser2 = User.builder()
                    .username("doctor2")
                    .password(encoder.encode("doctor"))
                    .email("james@clinic.com")
                    .firstName("James")
                    .lastName("Smith")
                    .role(Role.ROLE_DOCTOR)
                    .build();
            User savedDoc2 = userRepository.save(docUser2);

            DoctorProfile docProfile2 = DoctorProfile.builder()
                    .user(savedDoc2)
                    .specialization("Pediatrician")
                    .rating(4.7)
                    .description("Child specialist and pediatrician focused on pediatric development, physical health, and immunization.")
                    .availableSlots("10:00 AM;11:00 AM;12:00 PM;03:00 PM;04:00 PM")
                    .build();
            doctorProfileRepository.save(docProfile2);

            // Seed Doctor 3 (Neurologist)
            User docUser3 = User.builder()
                    .username("doctor3")
                    .password(encoder.encode("doctor"))
                    .email("elena@clinic.com")
                    .firstName("Elena")
                    .lastName("Vance")
                    .role(Role.ROLE_DOCTOR)
                    .build();
            User savedDoc3 = userRepository.save(docUser3);

            DoctorProfile docProfile3 = DoctorProfile.builder()
                    .user(savedDoc3)
                    .specialization("Neurologist")
                    .rating(4.8)
                    .description("Expert in diagnosis and management of disorders affecting the brain, spinal cord, nerves, and muscles.")
                    .availableSlots("09:00 AM;11:00 AM;02:00 PM;03:00 PM")
                    .build();
            doctorProfileRepository.save(docProfile3);

            System.out.println("Database seeded with sample patient and doctors successfully!");
        }
    }
}
