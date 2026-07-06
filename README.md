# 🏥 Health Clinic Portal

A full-stack Health Clinic Portal designed to simplify patient and clinic management. The application allows patients to book appointments, doctors to manage schedules, and administrators to efficiently manage users, appointments, and medical records through a secure and user-friendly interface.

---

## 🚀 Features

### 👨‍⚕️ Patient
- User Registration & Login
- Secure Authentication
- Book Appointments
- View Appointment History
- Update Profile
- View Doctor Details

### 👨‍⚕️ Doctor
- Secure Login
- View Daily Appointments
- Manage Appointment Status
- Update Availability
- View Patient Information

### 👨‍💼 Admin
- Dashboard Overview
- Manage Doctors
- Manage Patients
- Manage Appointments
- Manage Clinic Records
- View Reports

---

## 🛠️ Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript (ES6+)
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JWT (JSON Web Token)
- bcrypt.js

### Tools
- Git
- GitHub
- VS Code
- Postman

---

## 📂 Project Structure

```
Health-Clinic-Portal/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── config/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/Health-Clinic-Portal.git
```

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000

MONGO_URI=Your_MongoDB_Connection_String

JWT_SECRET=Your_JWT_Secret
```

---

## 📡 REST API

### Authentication

```
POST /api/auth/register
POST /api/auth/login
```

### Patients

```
GET /api/patients
GET /api/patients/:id
PUT /api/patients/:id
```

### Doctors

```
GET /api/doctors
POST /api/doctors
PUT /api/doctors/:id
DELETE /api/doctors/:id
```

### Appointments

```
POST /api/appointments
GET /api/appointments
PUT /api/appointments/:id
DELETE /api/appointments/:id
```

---

## 📸 Screenshots

Add screenshots here:

- 🏠 Home Page
- 🔐 Login Page
- 👨‍⚕️ Doctor Dashboard
- 👤 Patient Dashboard
- 📅 Appointment Booking
- 🛠️ Admin Dashboard

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Input Validation
- Secure REST APIs

---

## 📈 Future Enhancements

- Online Video Consultation
- Medical History Management
- Prescription Management
- Payment Gateway Integration
- Email Notifications
- SMS Appointment Reminder
- Lab Report Upload
- AI-Based Symptom Checker
- Analytics Dashboard

---

## 🎯 Learning Outcomes

This project helped me gain practical experience in:

- Full Stack Web Development
- RESTful API Development
- Authentication & Authorization
- MongoDB Database Design
- CRUD Operations
- Role-Based Access Control
- Responsive UI Development
- Git & GitHub Workflow

---

## 👨‍💻 Author

**Avanish Singh**

- GitHub: https://github.com/your-username
- LinkedIn: https://linkedin.com/in/your-linkedin
- Email: your-email@example.com

---

## ⭐ Show Your Support

If you found this project helpful, please consider giving it a ⭐ on GitHub.
