import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="glow-bg"></div>
      
      <!-- 1. Role Selection View -->
      <div class="portal-selector" *ngIf="selectedPortal === null && !isForgotMode && !isResetMode">
        <h1 class="logo-title">⚕️ HealthClinic</h1>
        <p class="subtitle">Select your portal to proceed</p>
        
        <div class="portal-grid">
          <div class="portal-card patient-card" (click)="selectPortal('patient')">
            <div class="card-icon">👤</div>
            <h3>Patient Portal</h3>
            <p>Book appointments, search specialist doctors, and download your prescriptions.</p>
            <button class="btn-portal">Enter Patient Portal</button>
          </div>

          <div class="portal-card doctor-card" (click)="selectPortal('doctor')">
            <div class="card-icon">🩻</div>
            <h3>Doctor Portal</h3>
            <p>Manage appointments, view patient details, and write digital prescriptions.</p>
            <button class="btn-portal">Enter Doctor Portal</button>
          </div>
        </div>
      </div>

      <!-- 2. Forgot Password Request View -->
      <div class="login-card" *ngIf="isForgotMode && !isResetMode">
        <button class="btn-back" (click)="cancelForgotPassword()">&larr; Back to Login</button>
        
        <h2 class="form-title">Reset Password</h2>
        <p class="subtitle">Enter your account email to receive a password reset link.</p>

        <div class="error-banner" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success-banner" *ngIf="successMessage">{{ successMessage }}</div>

        <form (ngSubmit)="onSendResetLink()">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="forgotEmail" name="forgotEmail" placeholder="example@clinic.com" required />
          </div>
          <button type="submit" class="btn-submit" [disabled]="!forgotEmail">Send Reset Link</button>
        </form>
      </div>

      <!-- 3. Reset Password Form View (triggered by email link token) -->
      <div class="login-card" *ngIf="isResetMode">
        <h2 class="form-title">New Password</h2>
        <p class="subtitle">Enter a new secure password for your account.</p>

        <div class="error-banner" *ngIf="errorMessage">{{ errorMessage }}</div>
        <div class="success-banner" *ngIf="successMessage">{{ successMessage }}</div>

        <form (ngSubmit)="onSaveNewPassword()">
          <div class="form-group password-group">
            <label>New Password</label>
            <div class="password-input-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" placeholder="••••••••" required />
              <button type="button" class="btn-eye" (click)="togglePasswordVisibility()">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>
          <button type="submit" class="btn-submit" [disabled]="!newPassword">Save New Password</button>
        </form>

        <div class="toggle-link">
          <a (click)="cancelResetMode()">Back to Login</a>
        </div>
      </div>

      <!-- 4. Login / Signup Form View -->
      <div class="login-card" *ngIf="selectedPortal !== null && !isForgotMode && !isResetMode">
        <button class="btn-back" (click)="goBack()">&larr; Back to Portals</button>
        
        <h2 class="form-title">
          {{ selectedPortal === 'doctor' ? 'Doctor Login' : 'Patient Login' }}
        </h2>
        <p class="subtitle">{{ isLogin ? 'Access your portal account' : 'Create your portal account' }}</p>

        <!-- Error Message -->
        <div class="error-banner" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div class="success-banner" *ngIf="successMessage">
          {{ successMessage }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <!-- Unified Fields -->
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="formData.username" name="username" placeholder="Enter username" required />
          </div>

          <div class="form-group password-group">
            <label>Password</label>
            <div class="password-input-wrapper">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="formData.password" name="password" placeholder="••••••••" required />
              <button type="button" class="btn-eye" (click)="togglePasswordVisibility()" title="Toggle Password Visibility">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <!-- Signup-only Fields -->
          <ng-container *ngIf="!isLogin">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" [(ngModel)]="formData.email" name="email" placeholder="example@clinic.com" required />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" [(ngModel)]="formData.firstName" name="firstName" placeholder="John" required />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" [(ngModel)]="formData.lastName" name="lastName" placeholder="Doe" required />
              </div>
            </div>

            <!-- Doctor specific fields -->
            <ng-container *ngIf="selectedPortal === 'doctor'">
              <div class="form-group">
                <label>Medical Specialization</label>
                <input type="text" [(ngModel)]="formData.specialization" name="specialization" placeholder="e.g., Cardiologist, Pediatrician" required />
              </div>
              <div class="form-group">
                <label>Professional Summary</label>
                <textarea [(ngModel)]="formData.description" name="description" placeholder="Brief details about your practice..." rows="3"></textarea>
              </div>
            </ng-container>
          </ng-container>

          <button type="submit" class="btn-submit">{{ isLogin ? 'Sign In' : 'Register Account' }}</button>
        </form>

        <div class="forgot-link-wrapper" *ngIf="isLogin">
          <a (click)="showForgotPassword()" class="forgot-link">Forgot Password?</a>
        </div>

        <div class="toggle-link">
          <a (click)="toggleMode()">
            {{ isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In' }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0b0f19;
      font-family: 'Outfit', 'Inter', sans-serif;
      color: #e2e8f0;
      overflow: hidden;
      padding: 20px;
    }
    .glow-bg {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(14,165,233,0) 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
      pointer-events: none;
    }
    .portal-selector {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 900px;
      text-align: center;
    }
    .portal-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 40px;
    }
    .portal-card {
      background: rgba(30, 41, 59, 0.4);
      backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      padding: 40px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .portal-card:hover {
      transform: translateY(-8px);
      border-color: #0ea5e9;
      background: rgba(30, 41, 59, 0.6);
      box-shadow: 0 15px 40px rgba(14, 165, 233, 0.15);
    }
    .card-icon {
      font-size: 3.5rem;
      margin-bottom: 20px;
    }
    .portal-card h3 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 15px;
      color: #ffffff;
    }
    .portal-card p {
      font-size: 0.95rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 30px;
      flex-grow: 1;
    }
    .btn-portal {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #38bdf8;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .portal-card:hover .btn-portal {
      background: #0ea5e9;
      border-color: #38bdf8;
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .login-card {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 450px;
      padding: 40px;
      background: rgba(30, 41, 59, 0.45);
      backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .btn-back {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.9rem;
      cursor: pointer;
      margin-bottom: 20px;
      padding: 0;
      transition: color 0.2s;
    }
    .btn-back:hover {
      color: #38bdf8;
    }
    .logo-title {
      font-size: 2.8rem;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #38bdf8, #0ea5e9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      margin-bottom: 30px;
    }
    .form-group {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-input-wrapper input {
      width: 100%;
      padding-right: 48px;
    }
    .btn-eye {
      position: absolute;
      right: 12px;
      background: transparent;
      border: none;
      font-size: 1.15rem;
      cursor: pointer;
      color: #94a3b8;
      padding: 0;
      outline: none;
      transition: transform 0.1s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-eye:active {
      transform: scale(0.9);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    input, select, textarea {
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #f8fafc;
      font-size: 0.95rem;
      transition: all 0.25s ease;
    }
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #0ea5e9;
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      background: rgba(15, 23, 42, 0.8);
    }
    .btn-submit {
      width: 100%;
      padding: 14px;
      margin-top: 15px;
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      border: none;
      border-radius: 10px;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }
    .btn-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(14, 165, 233, 0.45);
    }
    .forgot-link-wrapper {
      margin-top: -10px;
      margin-bottom: 20px;
      text-align: right;
    }
    .forgot-link {
      font-size: 0.85rem;
      color: #94a3b8;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }
    .forgot-link:hover {
      color: #38bdf8;
    }
    .toggle-link {
      margin-top: 25px;
      text-align: center;
    }
    .toggle-link a {
      font-size: 0.9rem;
      color: #94a3b8;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }
    .toggle-link a:hover {
      color: #38bdf8;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 12px;
      border-radius: 10px;
      font-size: 0.9rem;
      margin-bottom: 20px;
      text-align: center;
    }
    .success-banner {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
      padding: 12px;
      border-radius: 10px;
      font-size: 0.9rem;
      margin-bottom: 20px;
      text-align: center;
    }
    @media (max-width: 768px) {
      .portal-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  selectedPortal: 'patient' | 'doctor' | null = null;
  isLogin = true;
  showPassword = false;
  
  // Forgot Password / Reset Password states
  isForgotMode = false;
  isResetMode = false;
  forgotEmail = '';
  newPassword = '';
  resetToken = '';

  formData = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'patient',
    specialization: '',
    description: ''
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Listen for query parameters containing password reset token
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.resetToken = params['token'];
        this.isResetMode = true;
        this.errorMessage = '';
        this.successMessage = '';
      }
    });
  }

  selectPortal(portal: 'patient' | 'doctor'): void {
    this.selectedPortal = portal;
    this.formData.role = portal;
    this.isLogin = true;
    this.showPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack(): void {
    this.selectedPortal = null;
    this.showPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.showPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Forgot Password Actions
  showForgotPassword(): void {
    this.isForgotMode = true;
    this.isResetMode = false;
    this.forgotEmail = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelForgotPassword(): void {
    this.isForgotMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelResetMode(): void {
    this.isResetMode = false;
    this.resetToken = '';
    this.newPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.router.navigate(['/login']); // clear query parameter
  }

  onSendResetLink(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (msg) => {
        this.successMessage = msg;
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to send reset link.';
      }
    });
  }

  onSaveNewPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.resetToken, this.newPassword).subscribe({
      next: (msg) => {
        this.successMessage = msg + ' You can now log in.';
        // Delay redirect back to login portal screen
        setTimeout(() => {
          this.cancelResetMode();
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = err.error || 'Failed to reset password.';
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isLogin) {
      this.authService.login({
        username: this.formData.username,
        password: this.formData.password
      }).subscribe({
        next: (user) => {
          if (user.role === 'ROLE_DOCTOR') {
            this.router.navigate(['/doctor-dashboard']);
          } else {
            this.router.navigate(['/patient-dashboard']);
          }
        },
        error: (err) => {
          this.errorMessage = err.error || 'Authentication failed. Please verify credentials.';
        }
      });
    } else {
      this.authService.signup({
        ...this.formData,
        role: this.selectedPortal
      }).subscribe({
        next: () => {
          this.successMessage = 'Registration complete! You can now log in.';
          this.isLogin = true;
          this.formData.password = '';
        },
        error: (err) => {
          this.errorMessage = err.error || 'Registration failed. Try again.';
        }
      });
    }
  }
}
