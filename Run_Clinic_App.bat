@echo off
echo ===================================================
echo Starting Health Clinic Backend (Spring Boot)...
echo ===================================================
start cmd /k "cd /d C:\Users\Avanish singh\.gemini\antigravity\scratch\health-clinic\clinic-backend && .\mvnw.cmd spring-boot:run"

echo ===================================================
echo Starting Health Clinic Frontend (Angular)...
echo ===================================================
start cmd /k "cd /d C:\Users\Avanish singh\.gemini\antigravity\scratch\health-clinic\clinic-frontend && npx ng serve --port 4200"

echo Both servers are starting up in separate windows!
echo Backend API will be on http://localhost:8080
echo Frontend Web App will be on http://localhost:4200
pause
