import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('clinic_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Doctor Profiles
  searchDoctors(specialization?: string): Observable<any[]> {
    const headers = this.getHeaders();
    const url = specialization ? `${this.baseUrl}/doctors/search?specialization=${specialization}` : `${this.baseUrl}/doctors/search`;
    return this.http.get<any[]>(url, { headers });
  }

  getDoctorProfile(userId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/doctors/profile/${userId}`, { headers });
  }

  // Appointments
  bookAppointment(bookingData: { doctorProfileId: number; appointmentDate: string; timeSlot: string }): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/appointments/book`, bookingData, { headers });
  }

  getPatientAppointments(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/appointments/patient`, { headers });
  }

  getDoctorAppointments(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/appointments/doctor`, { headers });
  }

  updateAppointmentStatus(id: number, status: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.baseUrl}/appointments/${id}/status?status=${status}`, {}, { headers, responseType: 'text' });
  }

  // Prescriptions
  writePrescription(appointmentId: number, prescriptionData: { diagnosis: string; medications: string; dosageInstructions: string }): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.baseUrl}/prescriptions/write/${appointmentId}`, prescriptionData, { headers });
  }

  getPrescriptionByAppointment(appointmentId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.baseUrl}/prescriptions/appointment/${appointmentId}`, { headers });
  }

  getPatientPrescriptionHistory(patientId: number): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/prescriptions/patient/${patientId}`, { headers });
  }

  downloadPrescriptionPdfUrl(prescriptionId: number): string {
    const token = localStorage.getItem('clinic_token');
    return `${this.baseUrl}/prescriptions/${prescriptionId}/download?access_token=${token}`; // Token query fallback if needed, or trigger via blob download
  }

  downloadPrescriptionBlob(prescriptionId: number): Observable<Blob> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/prescriptions/${prescriptionId}/download`, {
      headers,
      responseType: 'blob'
    });
  }
}
