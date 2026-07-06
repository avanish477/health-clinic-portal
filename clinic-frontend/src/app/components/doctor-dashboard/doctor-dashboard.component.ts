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
        <div class="logo">⚕️ HealthClinic Doctor Workspace</div>
        <div class="user-meta">
          <span>Welcome, <strong>Dr. {{ currentUser?.username }}</strong></span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <!-- Main Body -->
      <div class="dashboard-content">
        <div class="appointments-section">
          <h2>Appointments Schedule</h2>

          <!-- Appointments List -->
          <div class="appointments-list">
            <div class="appointment-card" *ngFor="let app of appointments" [class.completed]="app.status === 'COMPLETED'">
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
                <span *ngIf="app.status === 'COMPLETED'" class="status-text">✓ Completed</span>
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

      <!-- Prescription Modal Overlay -->
      <div class="modal-overlay" *ngIf="activeAppointment">
        <div class="prescription-modal">
          <h3>Write Prescription for {{ activeAppointment.patient.firstName }} {{ activeAppointment.patient.lastName }}</h3>
          <p class="app-details">Date: {{ activeAppointment.appointmentDate }} | Time: {{ activeAppointment.timeSlot }}</p>

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
  `,
  styles: [`
    .dashboard-layout {
      min-height: 100vh;
      background: #0f172a;
      color: #f1f5f9;
      font-family: 'Outfit', sans-serif;
    }
    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      background: rgba(30, 41, 59, 0.5);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0ea5e9;
    }
    .user-meta {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .btn-logout {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.35);
    }
    .dashboard-content {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px;
    }
    h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #0ea5e9;
      margin-bottom: 25px;
    }
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .appointment-card {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 20px;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.5fr;
      align-items: center;
      gap: 20px;
    }
    .appointment-card.completed {
      border-left: 4px solid #10b981;
    }
    .patient-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
      margin-bottom: 4px;
    }
    .schedule-time {
      color: #38bdf8;
      font-size: 0.9rem;
      margin-bottom: 4px;
    }
    .patient-email {
      color: #64748b;
      font-size: 0.85rem;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      display: inline-block;
    }
    .status-badge.scheduled { background: rgba(14,165,233,0.15); color: #38bdf8; }
    .status-badge.completed { background: rgba(16,185,129,0.15); color: #34d399; }
    .status-badge.cancelled { background: rgba(239,68,68,0.15); color: #f87171; }
    .status-badge.no_show { background: rgba(245,158,11,0.15); color: #fbbf24; }
    
    .app-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-noshow {
      background: transparent;
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-noshow:hover { background: rgba(245, 158, 11, 0.15); }
    
    .btn-prescribe {
      background: #10b981;
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-prescribe:hover { background: #059669; }
    
    .status-text {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 600;
    }
    .status-text.cancelled { color: #f87171; }
    .status-text.noshow { color: #fbbf24; }
    
    .empty-state {
      color: #64748b;
      text-align: center;
      padding: 40px;
      font-style: italic;
    }
    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .prescription-modal {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      width: 100%;
      max-width: 550px;
      padding: 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .prescription-modal h3 {
      margin-top: 0;
      font-size: 1.4rem;
      color: #ffffff;
    }
    .app-details {
      color: #38bdf8;
      font-size: 0.9rem;
      margin-bottom: 25px;
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #0ea5e9;
      text-transform: uppercase;
    }
    input, textarea {
      padding: 10px 14px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: white;
      font-size: 0.95rem;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #0ea5e9;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
    }
    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: #94a3b8;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-primary {
      background: #10b981;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:disabled {
      background: #475569;
      color: #94a3b8;
      cursor: not-allowed;
    }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  currentUser: any;
  appointments: any[] = [];
  activeAppointment: any = null;
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
        // Sort appointments by id descending (newest first)
        this.appointments = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => console.error(err)
    });
  }

  markNoShow(id: number): void {
    if (confirm('Mark this patient as a No-Show?')) {
      this.clinicService.updateAppointmentStatus(id, 'NO_SHOW').subscribe({
        next: () => {
          this.loadAppointments();
        },
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
  }

  submitPrescription(): void {
    if (!this.activeAppointment) return;

    this.clinicService.writePrescription(this.activeAppointment.id, this.prescriptionData).subscribe({
      next: () => {
        this.activeAppointment = null;
        this.loadAppointments();
        alert('Prescription submitted and appointment marked as completed!');
      },
      error: (err) => alert(err.error || 'Failed to submit prescription')
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
