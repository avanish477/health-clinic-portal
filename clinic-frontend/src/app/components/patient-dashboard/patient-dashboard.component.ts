import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClinicService } from '../../services/clinic.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-layout">
      <!-- Navbar -->
      <nav class="nav-bar">
        <div class="logo">⚕️ HealthClinic Patient</div>
        <div class="user-meta">
          <span>Welcome, <strong>{{ currentUser?.username }}</strong></span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <!-- Main Body -->
      <div class="dashboard-content">
        <!-- Left Side: Search & Book -->
        <div class="search-section">
          <h2>Find a Doctor</h2>
          <div class="search-bar">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by Specialization (e.g. Cardiologist)" />
            <button (click)="onSearch()" class="btn-search">Search</button>
          </div>

          <!-- Doctor Cards Grid -->
          <div class="doctors-grid">
            <div class="doctor-card" *ngFor="let doc of doctors">
              <div class="doc-header">
                <h3>Dr. {{ doc.user.firstName }} {{ doc.user.lastName }}</h3>
                <span class="rating">⭐ {{ doc.rating }}</span>
              </div>
              <p class="specialization">{{ doc.specialization }}</p>
              <p class="desc">{{ doc.description }}</p>
              
              <button (click)="openBooking(doc)" class="btn-book-trigger">Book Appointment</button>
            </div>
            <div *ngIf="doctors.length === 0" class="empty-state">
              No doctors found matching this specialization.
            </div>
          </div>
        </div>

        <!-- Right Side: Appointments -->
        <div class="appointments-section">
          <h2>My Appointments</h2>
          <div class="appointments-list">
            <div class="appointment-card" *ngFor="let app of appointments">
              <div class="app-header">
                <h4>Dr. {{ app.doctorProfile.user.firstName }} {{ app.doctorProfile.user.lastName }}</h4>
                <span class="status-badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
              </div>
              <p class="app-meta">📅 {{ app.appointmentDate }} | ⏰ {{ app.timeSlot }}</p>
              
              <div class="actions">
                <button *ngIf="app.status === 'SCHEDULED'" (click)="cancelAppointment(app.id)" class="btn-cancel">Cancel Appointment</button>
                <button *ngIf="app.status === 'COMPLETED'" (click)="downloadPrescription(app.id)" class="btn-download">📄 Download Prescription</button>
              </div>
            </div>
            <div *ngIf="appointments.length === 0" class="empty-state">
              You have no active appointments booked.
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Modal Overlay -->
      <div class="modal-overlay" *ngIf="selectedDoctor">
        <div class="booking-modal">
          <h3>Book Appointment with Dr. {{ selectedDoctor.user.firstName }} {{ selectedDoctor.user.lastName }}</h3>
          <p class="specialization">{{ selectedDoctor.specialization }}</p>

          <div class="form-group">
            <label>Select Date</label>
            <input type="date" [(ngModel)]="bookingData.appointmentDate" class="input-date" [min]="todayDate" />
          </div>

          <div class="form-group">
            <label>Select Time Slot</label>
            <div class="slots-grid">
              <button 
                *ngFor="let slot of availableSlots" 
                (click)="bookingData.timeSlot = slot"
                [class.selected]="bookingData.timeSlot === slot"
                class="slot-btn"
                type="button">
                {{ slot }}
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="selectedDoctor = null" class="btn-secondary">Close</button>
            <button (click)="confirmBooking()" class="btn-primary" [disabled]="!bookingData.appointmentDate || !bookingData.timeSlot">Confirm Booking</button>
          </div>
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
      color: #38bdf8;
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
      max-width: 1200px;
      margin: 40px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 40px;
    }
    h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 25px;
    }
    .search-bar {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
    }
    .search-bar input {
      flex: 1;
      padding: 12px 18px;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: #ffffff;
    }
    .btn-search {
      background: #0ea5e9;
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .doctors-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .doctor-card {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 15px;
      padding: 24px;
    }
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .doc-header h3 {
      font-size: 1.25rem;
      margin: 0;
      color: #ffffff;
    }
    .rating {
      color: #eab308;
      font-weight: 600;
    }
    .specialization {
      color: #38bdf8;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .desc {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .btn-book-trigger {
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.3);
      color: #38bdf8;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-book-trigger:hover {
      background: rgba(14, 165, 233, 0.3);
    }
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .appointment-card {
      background: rgba(30, 41, 59, 0.4);
      border-left: 4px solid #0ea5e9;
      border-radius: 0 12px 12px 0;
      padding: 20px;
    }
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .app-header h4 {
      margin: 0;
      font-size: 1.1rem;
      color: #ffffff;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .status-badge.scheduled { background: rgba(14,165,233,0.15); color: #38bdf8; }
    .status-badge.completed { background: rgba(34,197,94,0.15); color: #4ade80; }
    .status-badge.cancelled { background: rgba(239,68,68,0.15); color: #f87171; }
    .app-meta {
      color: #94a3b8;
      font-size: 0.9rem;
      margin-bottom: 15px;
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn-cancel {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-cancel:hover { background: rgba(239,68,68,0.25); }
    .btn-download {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .btn-download:hover { background: rgba(34,197,94,0.25); }
    .empty-state {
      color: #64748b;
      text-align: center;
      padding: 30px;
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
    .booking-modal {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      width: 100%;
      max-width: 500px;
      padding: 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .booking-modal h3 {
      margin-top: 0;
      font-size: 1.4rem;
      color: #ffffff;
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
      color: #38bdf8;
      text-transform: uppercase;
    }
    .input-date {
      padding: 10px 14px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: white;
    }
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 5px;
    }
    .slot-btn {
      padding: 10px;
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .slot-btn.selected {
      background: #0ea5e9;
      border-color: #38bdf8;
      color: white;
      font-weight: 600;
    }
    .slot-btn:hover:not(.selected) {
      background: rgba(255,255,255,0.05);
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
      background: #0ea5e9;
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
export class PatientDashboardComponent implements OnInit {
  currentUser: any;
  searchQuery = '';
  doctors: any[] = [];
  appointments: any[] = [];
  
  selectedDoctor: any = null;
  bookingData = {
    doctorProfileId: 0,
    appointmentDate: '',
    timeSlot: ''
  };
  availableSlots: string[] = [];
  todayDate = '';

  constructor(
    private authService: AuthService,
    private clinicService: ClinicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || this.authService.getRole() !== 'ROLE_PATIENT') {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = this.authService.getCurrentUser();
    this.todayDate = new Date().toISOString().split('T')[0];
    this.loadDoctors();
    this.loadAppointments();
  }

  loadDoctors(): void {
    this.clinicService.searchDoctors(this.searchQuery).subscribe({
      next: (data) => this.doctors = data,
      error: (err) => console.error(err)
    });
  }

  loadAppointments(): void {
    this.clinicService.getPatientAppointments().subscribe({
      next: (data) => {
        // Sort appointments by date and time
        this.appointments = data.sort((a, b) => b.id - a.id);
      },
      error: (err) => console.error(err)
    });
  }

  onSearch(): void {
    this.loadDoctors();
  }

  openBooking(doctor: any): void {
    this.selectedDoctor = doctor;
    this.bookingData = {
      doctorProfileId: doctor.id,
      appointmentDate: '',
      timeSlot: ''
    };
    // Parse availability slots from semicolon separated string
    this.availableSlots = doctor.availableSlots ? doctor.availableSlots.split(';') : [];
  }

  confirmBooking(): void {
    this.clinicService.bookAppointment(this.bookingData).subscribe({
      next: () => {
        this.selectedDoctor = null;
        this.loadAppointments();
        alert('Appointment booked successfully!');
      },
      error: (err) => alert(err.error || 'Failed to book appointment')
    });
  }

  cancelAppointment(id: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.clinicService.updateAppointmentStatus(id, 'CANCELLED').subscribe({
        next: () => {
          this.loadAppointments();
        },
        error: (err) => alert('Error: ' + err.message)
      });
    }
  }

  downloadPrescription(appointmentId: number): void {
    this.clinicService.getPrescriptionByAppointment(appointmentId).subscribe({
      next: (prescription) => {
        this.clinicService.downloadPrescriptionBlob(prescription.id).subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `prescription-${prescription.id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          },
          error: (err) => alert('Error downloading PDF: ' + err.message)
        });
      },
      error: (err) => alert('Prescription record not found yet!')
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
