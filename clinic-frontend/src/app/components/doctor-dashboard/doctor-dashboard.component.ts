import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClinicService } from '../../services/clinic.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Navbar -->
      <nav class="nav-bar">
        <div class="logo">⚕️ HealthClinic <span class="badge-role doctor">Doctor Workspace</span></div>
        <div class="user-meta">
          <div class="profile-avatar">
            <span class="avatar-letter">{{ currentUser?.username?.charAt(0)?.toUpperCase() }}</span>
            <div class="profile-info">
              <span class="user-name">Dr. {{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
              <span class="user-role">Medical Staff</span>
            </div>
          </div>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <!-- Main Body -->
      <div class="dashboard-content">
        <div class="appointments-section glass-panel">
          <div class="section-header">
            <h2>Appointments Schedule</h2>
            <p class="section-desc">Manage patient visits and digital health records</p>
          </div>

          <!-- Appointments List -->
          <div class="appointments-list">
            <div class="appointment-card glass-panel" *ngFor="let app of appointments" [class.completed]="app.status === 'COMPLETED'">
              <div class="app-info">
                <div class="patient-name">Patient: {{ app.patient.firstName }} {{ app.patient.lastName }}</div>
                <div class="schedule-time">📅 {{ app.appointmentDate }} | ⏰ {{ app.timeSlot }}</div>
                <div class="patient-email">📧 {{ app.patient.email }}</div>
              </div>
              
              <div class="app-status">
                <span class="status-badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
              </div>

              <div class="app-actions">
                <ng-container *ngIf="app.status === 'SCHEDULED'">
                  <button (click)="markNoShow(app.id)" class="btn-noshow">No Show</button>
                  <button (click)="openPrescriptionModal(app)" class="btn-prescribe">✍️ Write Prescription</button>
                </ng-container>
                <span *ngIf="app.status === 'COMPLETED'" class="status-text completed">✓ Completed</span>
                <span *ngIf="app.status === 'CANCELLED'" class="status-text cancelled">✗ Cancelled</span>
                <span *ngIf="app.status === 'NO_SHOW'" class="status-text noshow">✗ No Show</span>
              </div>
            </div>
            <div *ngIf="appointments.length === 0" class="empty-state">
              No appointments have been scheduled with you yet.
            </div>
          </div>
        </div>
      </div>

      <!-- Prescription & Patient History Split-Modal Overlay -->
      <div class="modal-overlay" *ngIf="activeAppointment">
        <div class="prescription-modal glass-panel split-modal">
          <!-- Close Modal Header -->
          <div class="modal-header-row">
            <h3>Consultation Workspace</h3>
            <button (click)="activeAppointment = null" class="btn-close-modal">×</button>
          </div>
          
          <div class="workspace-grid">
            <!-- Left Pane: Patient History Drawer -->
            <div class="history-pane glass-panel">
              <h4>Patient History Logs</h4>
              <p class="pane-subtitle">Past diagnoses and medications records</p>
              
              <div class="history-list">
                <div class="history-item" *ngFor="let record of patientHistory">
                  <div class="history-header">
                    <span class="history-diag">📋 {{ record.diagnosis }}</span>
                    <span class="history-date">{{ record.createdDate }}</span>
                  </div>
                  <p class="history-meds"><strong>Meds:</strong> {{ record.medications }}</p>
                  <p class="history-inst" *ngIf="record.dosageInstructions"><strong>Inst:</strong> {{ record.dosageInstructions }}</p>
                </div>
                
                <div *ngIf="patientHistory.length === 0" class="empty-history">
                  No past medical records found for this patient.
                </div>
              </div>
            </div>

            <!-- Right Pane: Prescription Form -->
            <div class="prescription-pane">
              <h4>Active Prescription Form</h4>
              <p class="pane-subtitle">Patient: {{ activeAppointment.patient.firstName }} {{ activeAppointment.patient.lastName }}</p>

              <form (ngSubmit)="submitPrescription()">
                <div class="form-group">
                  <label>Diagnosis / Condition</label>
                  <input type="text" [(ngModel)]="prescriptionData.diagnosis" name="diagnosis" placeholder="E.g., Hypertension, Common Cold" required />
                </div>

                <div class="form-group">
                  <label>Medications</label>
                  <textarea [(ngModel)]="prescriptionData.medications" name="medications" placeholder="E.g., Paracetamol 500mg - 1 tablet 3 times a day" rows="3" required></textarea>
                </div>

                <div class="form-group">
                  <label>Dosage & Special Instructions</label>
                  <textarea [(ngModel)]="prescriptionData.dosageInstructions" name="dosageInstructions" placeholder="E.g., Take after meals. Rest for 3 days." rows="3"></textarea>
                </div>

                <div class="modal-actions">
                  <button type="button" (click)="activeAppointment = null" class="btn-secondary">Cancel</button>
                  <button type="submit" class="btn-primary" [disabled]="!prescriptionData.diagnosis || !prescriptionData.medications">Submit & Complete</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background: linear-gradient(135deg, #0b0f19 0%, #111827 100%);
      color: #f3f4f6;
      font-family: 'Outfit', sans-serif;
      padding-bottom: 50px;
    }
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 40px;
      background: rgba(17, 24, 39, 0.6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: 800;
      color: white;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-role {
      font-size: 10px;
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.3);
      color: #38bdf8;
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-role.doctor {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .user-meta {
      display: flex;
      align-items: center;
      gap: 25px;
    }
    .profile-avatar {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-letter {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .profile-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: white;
    }
    .user-role {
      font-size: 10px;
      color: #94a3b8;
    }
    .btn-logout {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 7px 16px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: 700;
      font-size: 12px;
      transition: all 0.3s;
    }
    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.25);
    }
    .dashboard-content {
      max-width: 1100px;
      margin: 30px auto;
      padding: 0 20px;
    }
    .glass-panel {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 25px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    .section-header {
      margin-bottom: 25px;
    }
    .section-header h2 {
      font-size: 1.5rem;
      font-weight: 800;
      color: white;
      margin: 0 0 4px 0;
    }
    .section-desc {
      font-size: 12px;
      color: #94a3b8;
      margin: 0;
    }
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .appointment-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 20px;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.5fr;
      align-items: center;
      gap: 20px;
      transition: all 0.3s;
    }
    .appointment-card:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .appointment-card.completed {
      border-left: 4px solid #10b981;
    }
    .app-info {
      text-align: left;
    }
    .patient-name {
      font-size: 15px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }
    .schedule-time {
      color: #34d399;
      font-size: 12px;
      margin-bottom: 4px;
      font-weight: 600;
    }
    .patient-email {
      color: #94a3b8;
      font-size: 11px;
    }
    .status-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    .status-badge.scheduled { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; }
    .status-badge.completed { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
    .status-badge.cancelled { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
    .status-badge.no_show { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; }
    
    .app-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-noshow {
      background: transparent;
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      padding: 7px 15px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.3s;
    }
    .btn-noshow:hover {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.4);
    }
    .btn-prescribe {
      background: #10b981;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.3s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    .btn-prescribe:hover {
      background: #059669;
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }
    .status-text {
      color: #94a3b8;
      font-size: 12px;
      font-weight: 700;
    }
    .status-text.completed { color: #34d399; }
    .status-text.cancelled { color: #f87171; }
    .status-text.noshow { color: #fbbf24; }
    
    .empty-state {
      color: #64748b;
      text-align: center;
      padding: 40px;
      font-style: italic;
      font-size: 13px;
    }
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(7, 10, 18, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .prescription-modal {
      background: #0f141f;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      width: 95%;
      max-width: 900px;
      padding: 30px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .modal-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 12px;
    }
    .modal-header-row h3 {
      margin: 0;
      font-size: 1.3rem;
      color: white;
      font-weight: 800;
    }
    .btn-close-modal {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 22px;
      cursor: pointer;
      outline: none;
    }
    .workspace-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 30px;
    }
    .history-pane {
      background: rgba(255, 255, 255, 0.01) !important;
      border-color: rgba(255, 255, 255, 0.04) !important;
      display: flex;
      flex-direction: column;
      max-height: 420px;
    }
    .history-pane h4, .prescription-pane h4 {
      margin: 0 0 2px 0;
      font-size: 14px;
      font-weight: 700;
      color: white;
      text-align: left;
    }
    .pane-subtitle {
      font-size: 11px;
      color: #94a3b8;
      margin: 0 0 15px 0;
      text-align: left;
    }
    .history-list {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-right: 5px;
    }
    .history-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 12px;
      text-align: left;
    }
    .history-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .history-diag {
      font-size: 12px;
      font-weight: 700;
      color: #34d399;
    }
    .history-date {
      font-size: 10px;
      color: #64748b;
    }
    .history-meds, .history-inst {
      font-size: 11px;
      color: #94a3b8;
      margin: 0 0 4px 0;
    }
    .empty-history {
      color: #64748b;
      font-size: 12px;
      font-style: italic;
      padding: 30px 10px;
    }
    .prescription-pane {
      display: flex;
      flex-direction: column;
    }
    .form-group {
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }
    label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group input, .form-group textarea {
      padding: 10px 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      color: white;
      font-size: 12px;
    }
    .form-group input:focus, .form-group textarea:focus {
      border-color: #10b981;
      background: rgba(255,255,255,0.05);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
    }
    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }
    .btn-primary {
      background: #10b981;
      border: none;
      color: white;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
      transition: all 0.3s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #059669;
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
    }
    .btn-primary:disabled {
      background: #334155;
      color: #64748b;
      cursor: not-allowed;
      box-shadow: none;
    }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: any;
  appointments: any[] = [];
  
  activeAppointment: any = null;
  patientHistory: any[] = [];
  prescriptionData = {
    diagnosis: '',
    medications: '',
    dosageInstructions: ''
  };

  constructor(
    private authService: AuthService,
    private clinicService: ClinicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getRole() !== 'ROLE_DOCTOR') {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.getCurrentUser();
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.clinicService.getDoctorAppointments().subscribe({
      next: (data) => {
        this.appointments = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => console.error(err)
    });
  }

  markNoShow(id: number): void {
    if (confirm('Mark this appointment as a No Show?')) {
      this.clinicService.updateAppointmentStatus(id, 'NO_SHOW').subscribe({
        next: () => this.loadAppointments(),
        error: (err) => alert('Error: ' + err.message)
      });
    }
  }

  openPrescriptionModal(appointment: any): void {
    this.activeAppointment = appointment;
    this.prescriptionData = {
      diagnosis: '',
      medications: '',
      dosageInstructions: ''
    };
    
    this.patientHistory = [];
    this.clinicService.getPatientPrescriptionHistory(appointment.patient.id).subscribe({
      next: (data) => {
        this.patientHistory = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => console.error('Error fetching patient history:', err)
    });
  }

  submitPrescription(): void {
    if (!this.activeAppointment) return;
    
    this.clinicService.writePrescription(this.activeAppointment.id, this.prescriptionData).subscribe({
      next: () => {
        this.activeAppointment = null;
        this.loadAppointments();
        alert('Prescription submitted and appointment completed!');
      },
      error: (err) => alert('Failed to write prescription: ' + (err.error || err.message))
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
