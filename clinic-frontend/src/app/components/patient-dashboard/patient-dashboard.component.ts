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
        <div class="logo">⚕️ HealthClinic <span class="badge-role">Patient Portal</span></div>
        <div class="user-meta">
          <div class="profile-avatar">
            <span class="avatar-letter">{{ currentUser?.username?.charAt(0)?.toUpperCase() }}</span>
            <div class="profile-info">
              <span class="user-name">Welcome, {{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
              <span class="user-role">Verified Patient</span>
            </div>
          </div>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </nav>

      <!-- Main Body -->
      <div class="dashboard-content">
        <!-- Left Side: Search & Book -->
        <div class="search-section glass-panel">
          <div class="section-header">
            <h2>Find a Doctor</h2>
            <p class="section-desc">Search by specialization or book a consultation instantly</p>
          </div>
          
          <div class="search-bar">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by Specialization (e.g. Cardiologist)" />
            <button (click)="onSearch()" class="btn-search">Search Doctors</button>
          </div>

          <!-- Doctor Cards Grid -->
          <div class="doctors-grid">
            <div class="doctor-card glass-panel" *ngFor="let doc of doctors">
              <div class="doc-avatar-container">
                <div class="doc-icon">👨‍⚕️</div>
                <div class="doc-header-details">
                  <h3>Dr. {{ doc.user.firstName }} {{ doc.user.lastName }}</h3>
                  <span class="specialization">{{ doc.specialization }}</span>
                </div>
                <span class="rating">⭐ {{ doc.rating }}</span>
              </div>
              <p class="desc">{{ doc.description }}</p>
              
              <div class="doc-footer">
                <span class="slots-indicator">🟢 Slots Available</span>
                <button (click)="openBooking(doc)" class="btn-book-trigger">Book Appointment</button>
              </div>
            </div>
            <div *ngIf="doctors.length === 0" class="empty-state">
              No doctors found matching this specialization.
            </div>
          </div>
        </div>

        <!-- Right Side: Appointments -->
        <div class="appointments-section glass-panel">
          <div class="section-header">
            <h2>My Appointments</h2>
            <p class="section-desc">Track timelines, invoices, and prescriptions</p>
          </div>

          <div class="appointments-list">
            <div class="appointment-card glass-panel" *ngFor="let app of appointments" [class.completed]="app.status === 'COMPLETED'">
              <div class="app-header">
                <div>
                  <h4>Dr. {{ app.doctorProfile.user.firstName }} {{ app.doctorProfile.user.lastName }}</h4>
                  <span class="app-specialization">{{ app.doctorProfile.specialization }}</span>
                </div>
                <span class="status-badge" [ngClass]="app.status.toLowerCase()">{{ app.status }}</span>
              </div>
              <p class="app-meta">📅 {{ app.appointmentDate }} | ⏰ {{ app.timeSlot }}</p>
              
              <!-- Wait-time indicator for scheduled slots -->
              <div *ngIf="app.status === 'SCHEDULED'" class="wait-time-badge">
                <span class="pulse-dot"></span> Est. Wait Queue: 15 mins
              </div>

              <div class="actions">
                <button *ngIf="app.status === 'SCHEDULED'" (click)="cancelAppointment(app.id)" class="btn-cancel">Cancel</button>
                <ng-container *ngIf="app.status === 'COMPLETED'">
                  <button (click)="downloadPrescription(app.id)" class="btn-download">📄 Prescription</button>
                  <button (click)="viewInvoice(app)" class="btn-invoice">🧾 Invoice</button>
                </ng-container>
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
        <div class="booking-modal glass-panel">
          <h3>Book Appointment</h3>
          <p class="modal-doc-name">Dr. {{ selectedDoctor.user.firstName }} {{ selectedDoctor.user.lastName }}</p>
          <span class="modal-specialization">{{ selectedDoctor.specialization }}</span>

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

          <!-- Consultation Fee Breakdown -->
          <div class="fee-estimate glass-panel">
            <div class="fee-row"><span>Consultation Fee</span><span>₹500</span></div>
            <div class="fee-row"><span>Registration Fee</span><span>₹100</span></div>
            <div class="fee-row total"><span>Total Estimated</span><span>₹600</span></div>
          </div>

          <div class="modal-actions">
            <button (click)="selectedDoctor = null" class="btn-secondary">Close</button>
            <button (click)="confirmBooking()" class="btn-primary" [disabled]="!bookingData.appointmentDate || !bookingData.timeSlot">Confirm & Pay</button>
          </div>
        </div>
      </div>

      <!-- Invoice Modal Overlay -->
      <div class="modal-overlay" *ngIf="selectedAppointmentForInvoice">
        <div class="booking-modal glass-panel invoice-modal">
          <div class="invoice-header">
            <h3>Consultation Receipt</h3>
            <span class="invoice-badge">PAID</span>
          </div>
          <div class="invoice-meta-info">
            <p><strong>Receipt No:</strong> REC-2026-{{ selectedAppointmentForInvoice.id }}</p>
            <p><strong>Date:</strong> {{ selectedAppointmentForInvoice.appointmentDate }}</p>
            <p><strong>Doctor:</strong> Dr. {{ selectedAppointmentForInvoice.doctorProfile.user.firstName }} {{ selectedAppointmentForInvoice.doctorProfile.user.lastName }}</p>
            <p><strong>Patient:</strong> {{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
          </div>

          <div class="fee-estimate glass-panel">
            <div class="fee-row"><span>Consultation Service</span><span>₹500.00</span></div>
            <div class="fee-row"><span>Hospital Registration</span><span>₹100.00</span></div>
            <div class="fee-row"><span>CGST (9%)</span><span>₹54.00</span></div>
            <div class="fee-row"><span>SGST (9%)</span><span>₹54.00</span></div>
            <div class="fee-row total"><span>Total Amount Paid</span><span>₹708.00</span></div>
          </div>

          <p class="payment-method-tag">💳 Paid via Razorpay Gateway</p>

          <div class="modal-actions">
            <button (click)="selectedAppointmentForInvoice = null" class="btn-secondary">Close</button>
            <button (click)="printInvoice()" class="btn-primary">Print Receipt</button>
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
      background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .profile-info {
      display: flex;
      flex-direction: column;
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
      max-width: 1200px;
      margin: 30px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 30px;
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
      margin-bottom: 20px;
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
    .search-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 25px;
    }
    .search-bar input {
      flex: 1;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: white;
      font-size: 13px;
      transition: all 0.3s;
    }
    .search-bar input:focus {
      border-color: #0ea5e9;
      box-shadow: 0 0 12px rgba(14, 165, 233, 0.25);
      background: rgba(255, 255, 255, 0.05);
    }
    .btn-search {
      background: #0ea5e9;
      border: none;
      color: white;
      padding: 12px 22px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
      transition: all 0.3s;
    }
    .btn-search:hover {
      background: #0284c7;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(14, 165, 233, 0.4);
    }
    .doctors-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .doctor-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.04);
      padding: 20px;
      border-radius: 14px;
      transition: all 0.3s ease;
    }
    .doctor-card:hover {
      border-color: rgba(14, 165, 233, 0.25);
      background: rgba(255, 255, 255, 0.02);
      transform: translateY(-2px);
    }
    .doc-avatar-container {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 12px;
    }
    .doc-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      background: rgba(14, 165, 233, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(14, 165, 233, 0.2);
    }
    .doc-header-details {
      flex: 1;
    }
    .doc-header-details h3 {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin: 0 0 2px 0;
    }
    .specialization {
      font-size: 11px;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rating {
      font-size: 12px;
      color: #fbbf24;
      font-weight: 700;
      background: rgba(251, 191, 36, 0.08);
      border: 1px solid rgba(251, 191, 36, 0.2);
      padding: 2px 8px;
      border-radius: 6px;
    }
    .desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0 0 15px 0;
    }
    .doc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.03);
      padding-top: 15px;
    }
    .slots-indicator {
      font-size: 11px;
      color: #4ade80;
      font-weight: 600;
    }
    .btn-book-trigger {
      background: rgba(14, 165, 233, 0.08);
      border: 1px solid rgba(14, 165, 233, 0.2);
      color: #38bdf8;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-book-trigger:hover {
      background: #0ea5e9;
      color: white;
      border-color: #0ea5e9;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .appointments-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .appointment-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-left: 4px solid #0ea5e9;
      border-radius: 0 12px 12px 0;
      padding: 20px;
      transition: all 0.3s;
    }
    .appointment-card.completed {
      border-left-color: #10b981;
    }
    .appointment-card:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .app-header h4 {
      margin: 0 0 2px 0;
      font-size: 15px;
      font-weight: 700;
      color: white;
    }
    .app-specialization {
      font-size: 11px;
      color: #94a3b8;
    }
    .status-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-badge.scheduled { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.3); color: #38bdf8; }
    .status-badge.completed { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
    .status-badge.cancelled { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
    .app-meta {
      color: #94a3b8;
      font-size: 12px;
      margin: 0 0 15px 0;
    }
    .wait-time-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(251, 191, 36, 0.08);
      border: 1px solid rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 15px;
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      background: #fbbf24;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 0.3; }
      50% { opacity: 1; }
      100% { opacity: 0.3; }
    }
    .actions {
      display: flex;
      gap: 10px;
    }
    .btn-cancel {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.3s;
    }
    .btn-cancel:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
    }
    .btn-download {
      background: rgba(34, 197, 94, 0.08);
      border: 1px solid rgba(34, 197, 94, 0.2);
      color: #4ade80;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.3s;
    }
    .btn-download:hover {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.4);
    }
    .btn-invoice {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      transition: all 0.3s;
    }
    .btn-invoice:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .empty-state {
      color: #64748b;
      text-align: center;
      padding: 30px;
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
      background: rgba(7, 10, 18, 0.8);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .booking-modal {
      background: #0f141f;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      width: 90%;
      max-width: 480px;
      padding: 30px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
      position: relative;
    }
    .booking-modal h3 {
      margin: 0 0 5px 0;
      font-size: 1.3rem;
      color: white;
      font-weight: 800;
    }
    .modal-doc-name {
      margin: 0 0 2px 0;
      font-size: 15px;
      font-weight: 600;
      color: white;
    }
    .modal-specialization {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #38bdf8;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .input-date {
      padding: 10px 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      color: white;
      font-size: 13px;
    }
    .input-date:focus {
      border-color: #0ea5e9;
    }
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 5px;
    }
    .slot-btn {
      padding: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 600;
    }
    .slot-btn.selected {
      background: #0ea5e9;
      border-color: #0ea5e9;
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.35);
    }
    .slot-btn:hover:not(.selected) {
      background: rgba(255,255,255,0.05);
    }
    .fee-estimate {
      margin-top: 20px;
      padding: 15px;
      background: rgba(255,255,255,0.01) !important;
      border-color: rgba(255,255,255,0.04) !important;
    }
    .fee-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .fee-row.total {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 10px;
      margin-top: 8px;
      font-weight: 700;
      color: white;
      font-size: 13px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 25px;
    }
    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      color: #94a3b8;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.05);
      color: white;
    }
    .btn-primary {
      background: #0ea5e9;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3);
      transition: all 0.3s;
    }
    .btn-primary:hover:not(:disabled) {
      background: #0284c7;
      box-shadow: 0 6px 18px rgba(14, 165, 233, 0.4);
    }
    .btn-primary:disabled {
      background: #334155;
      color: #64748b;
      cursor: not-allowed;
      box-shadow: none;
    }
    /* Invoice Modal specific styles */
    .invoice-modal {
      border-color: rgba(16, 185, 129, 0.2);
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 10px;
    }
    .invoice-badge {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
      padding: 2px 10px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
    }
    .invoice-meta-info {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 20px;
      line-height: 1.8;
      text-align: left;
    }
    .invoice-meta-info p {
      margin: 0;
    }
    .payment-method-tag {
      font-size: 11px;
      color: #4ade80;
      text-align: center;
      margin-top: 15px;
      font-weight: 600;
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  currentUser: any;
  searchQuery = '';
  doctors: any[] = [];
  appointments: any[] = [];
  
  selectedDoctor: any = null;
  selectedAppointmentForInvoice: any = null;
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

  viewInvoice(appointment: any): void {
    this.selectedAppointmentForInvoice = appointment;
  }

  printInvoice(): void {
    window.print();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

