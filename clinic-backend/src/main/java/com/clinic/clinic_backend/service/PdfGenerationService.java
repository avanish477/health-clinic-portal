package com.clinic.clinic_backend.service;

import com.clinic.clinic_backend.model.Prescription;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class PdfGenerationService {

    public ByteArrayInputStream generatePrescriptionPdf(Prescription prescription) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11);

            // Title
            Paragraph title = new Paragraph("MEDICAL PRESCRIPTION", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            // Doctor & Patient details
            document.add(new Paragraph("Doctor: Dr. " + prescription.getAppointment().getDoctorProfile().getUser().getFirstName() + " " + prescription.getAppointment().getDoctorProfile().getUser().getLastName() + " (" + prescription.getAppointment().getDoctorProfile().getSpecialization() + ")", headerFont));
            document.add(new Paragraph("Patient: " + prescription.getAppointment().getPatient().getFirstName() + " " + prescription.getAppointment().getPatient().getLastName() + " (" + prescription.getAppointment().getPatient().getEmail() + ")", normalFont));
            document.add(new Paragraph("Date: " + prescription.getCreatedDate().toString(), normalFont));
            document.add(Chunk.NEWLINE);
            
            document.add(new Paragraph("-----------------------------------------------------------------------------------------", normalFont));
            document.add(Chunk.NEWLINE);

            // Diagnosis
            document.add(new Paragraph("DIAGNOSIS:", headerFont));
            document.add(new Paragraph(prescription.getDiagnosis(), normalFont));
            document.add(Chunk.NEWLINE);

            // Medications
            document.add(new Paragraph("MEDICATIONS:", headerFont));
            document.add(new Paragraph(prescription.getMedications(), normalFont));
            document.add(Chunk.NEWLINE);

            // Dosage Instructions
            document.add(new Paragraph("DOSAGE & INSTRUCTIONS:", headerFont));
            document.add(new Paragraph(prescription.getDosageInstructions(), normalFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("-----------------------------------------------------------------------------------------", normalFont));
            document.add(Chunk.NEWLINE);
            
            Paragraph footer = new Paragraph("Thank you for choosing our clinic. Take care!", normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
