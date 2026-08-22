# Elevate — Login Removal & Admin Panel

## Project

We are working on the **Elevate college event website**.

Frontend repository:

`https://github.com/spamlord5566/elevateX`

The project has a Next.js frontend and an Express/Node.js + MongoDB Atlas backend.

## 1. Remove Student Login Completely

Remove the existing student/user login functionality entirely.

Remove or modify:

- Login page
- Login forms
- Login buttons
- Mock authentication
- Authentication state
- Protected student routes
- Student logout functionality
- Unnecessary login-related API calls

Students should **not need an account or password** to register.

Student flow:

```text
Student
   ↓
Registration Form
   ↓
Submit
   ↓
Backend
   ↓
MongoDB Atlas
```

Do not replace student login with another student authentication system.

## 2. Admin Panel

Create a separate admin panel at:

```text
/admin
```

The admin panel is separate from the normal student-facing website.

The admin panel should allow event organizers to:

- View registered teams
- View team/member details
- Search registrations
- View verification status
- Change verification status

## 3. Admin Authentication

Protect `/admin` with a password.

For development, an example password is:

```text
<your-admin-password>
```

**Never hardcode this password in frontend/client-side code.**

Store it on the backend:

```env
ADMIN_PASSWORD=<set-a-strong-secret-here>
```

Change the production password before deployment.

Conceptual flow:

```text
Admin enters password
        ↓
Frontend
        ↓
POST /api/admin/login
        ↓
Backend checks ADMIN_PASSWORD
        ↓
Successful authentication
        ↓
Admin can access protected admin APIs
```

Use a simple secure mechanism such as a signed session or JWT. Do not build an unnecessarily complicated authentication system.

## 4. Admin Route

Create:

```text
/admin
```

Unauthenticated users should see an admin password screen.

Incorrect password:

```text
Invalid admin password
```

Correct password:

```text
Show Admin Dashboard
```

The frontend route alone is not security. **Every admin data API must verify authentication on the backend.**

## 5. Admin Dashboard

Show registered teams.

Example:

```text
--------------------------------------------------
                 ELEVATE ADMIN
--------------------------------------------------

Total Teams: 42

[ Search Teams ]

--------------------------------------------------
Team         Members      College       Status
--------------------------------------------------
Team Alpha   4            FISAT        VERIFIED
Team Beta    3            MEC          PENDING
Team Gamma   5            RSET         VERIFIED
--------------------------------------------------
```

Use the actual registration fields from the existing frontend/MongoDB schema. Do not invent unnecessary fields.

## 6. Team Details

When an admin selects a team, display its registration information.

Example:

```text
Team Alpha

Team Name:
Team Alpha

College:
FISAT

Members:

1. John Doe
   Email: john@example.com
   Phone: **********

2. Rahul Kumar
   Email: rahul@example.com
   Phone: **********

Verification Status:
VERIFIED
```

Display only fields that actually exist and are useful to the admin.

## 7. Fetch Data From MongoDB Atlas

The admin dashboard must use the **real backend and MongoDB Atlas**.

Do not use mock registration data.

```text
Admin Dashboard
      ↓
Backend API
      ↓
MongoDB Atlas
      ↓
registrations collection
```

Use the existing frontend API abstraction where possible, especially:

```text
src/lib/api.ts
```

Possible helpers:

```javascript
getAdminTeams()
getAdminTeam(id)
updateTeamVerification(id, status)
```

Adapt these to the existing project structure.

## 8. Verification Status

Every registered team must have a verification status.

Only:

```text
PENDING
VERIFIED
```

A new registration defaults to:

```text
PENDING
```

## 9. Manual GPay Verification

Payment processing is **NOT being implemented**.

Do NOT add:

- GPay API
- Payment gateway
- Payment webhooks
- Automatic payment verification
- QR payment processing
- Payment APIs

The registration fee will be paid through GPay manually.

The admin checks the payment in real life and manually changes the status.

```text
Student registers
       ↓
Status = PENDING
       ↓
Student pays registration fee through GPay
       ↓
Admin checks GPay payment manually
       ↓
Admin changes:
PENDING → VERIFIED
```

## 10. Admin Verification Control

Each team needs a verification control.

Example:

```text
Verification Status:

[ Pending ▼ ]
```

Options:

```text
Pending
Verified
```

or:

```text
[ Mark as Verified ]
[ Mark as Pending ]
```

Send changes to the backend.

Example:

```http
PATCH /api/admin/registrations/:id/verification
```

Request:

```json
{
  "status": "VERIFIED"
}
```

or:

```json
{
  "status": "PENDING"
}
```

The backend must only accept these two values.

## 11. MongoDB Registration Model

Add a verification field to the existing registration model:

```javascript
verificationStatus: {
    type: String,
    enum: ["PENDING", "VERIFIED"],
    default: "PENDING"
}
```

Do not create a separate payment collection.

For now, verification status represents whether the admin has manually confirmed payment.

## 12. Admin Backend APIs

Use protected endpoints such as:

```http
POST  /api/admin/login
GET   /api/admin/registrations
GET   /api/admin/registrations/:id
PATCH /api/admin/registrations/:id/verification
```

All endpoints except login must require admin authentication.

Adjust route names if necessary to fit the existing backend.

## 13. Security Requirements

The admin panel contains student registration information.

### Never:

- Hardcode `elevate@123` in client code.
- Store the admin password in `localStorage`.
- Expose `ADMIN_PASSWORD` using a `NEXT_PUBLIC_` variable.
- Make admin registration APIs public.
- Trust a frontend-only `isAdmin` variable.
- Allow verification updates without backend authentication.

### Do:

- Store admin secrets on the backend.
- Validate authentication on every protected admin request.
- Use HTTPS in production.
- Configure CORS correctly.
- Rate-limit admin login attempts.
- Avoid exposing unnecessary student data.
- Use generic authentication errors.
- Keep `.env` out of Git.

## 14. Student Website

Keep the student experience simple:

```text
Home
 ↓
Event Information
 ↓
Registration
 ↓
Submit Registration
 ↓
Confirmation
```

There should be:

- No student login
- No student signup/account
- No student dashboard
- No student password
- No student logout

## 15. Student/Admin Separation

Public:

```text
/
/registration
/other event pages
```

Admin:

```text
/admin
```

The `/admin` route is the frontend entry point, but actual protection must happen through the backend APIs.

## 16. Admin UI

Keep the admin panel simple and functional.

Include:

- Admin login screen
- Total registered team count
- Search
- Team/registration table
- Verification status
- Team details
- Status update control
- Logout button

Prioritize functionality, security, and readability over complex design.

## 17. Search

Allow the admin to search registrations by:

- Team name
- Member name
- Email
- College

Since this is a small event, client-side filtering is acceptable initially. If registrations become large, move filtering/search to the backend.

## 18. Data Privacy

Only authenticated admins should access:

- Names
- Email addresses
- Phone numbers
- College
- Team information

Do not expose all registrations through a public endpoint such as:

```http
GET /api/registrations
```

Use a protected endpoint:

```http
GET /api/admin/registrations
```

## 19. Do NOT Implement

Do not implement:

- Student login
- Student signup/account creation
- Student password reset
- Student authentication
- GPay integration
- Payment gateway
- Automatic payment verification
- Payment webhooks
- Certificate generation
- Certificate PDFs
- Certificate emails
- Certificate verification
- Complex role management

Keep the project focused on registration management and manual verification.

## 20. Final Architecture

```text
                    ELEVATE
                       │
              ┌────────┴────────┐
              │                 │
           STUDENT             ADMIN
              │                 │
       Registration          /admin
              │                 │
              │            Admin Password
              │                 │
              ↓                 ↓
         Express API       Admin Auth API
              │                 │
              └────────┬────────┘
                       ↓
                  MongoDB Atlas
                       │
                  registrations
                       │
             ┌─────────┴─────────┐
             │                   │
         Team Data         Verification Status
                               │
                         PENDING / VERIFIED
```

## 21. Important Implementation Rules

Before modifying anything:

1. Inspect the existing frontend.
2. Identify all login/authentication files.
3. Remove login without breaking registration.
4. Inspect `src/lib/api.ts`.
5. Inspect the existing registration data structure.
6. Identify how mock APIs currently work.
7. Build the admin UI around the actual registration structure.
8. Connect the admin UI to the real backend.
9. Keep student and admin functionality separate.
10. Do not rewrite unrelated frontend code.
11. Preserve the existing Elevate design as much as possible.

## 22. Final Goal

### Student

```text
Fill Registration Form
        ↓
Submit
        ↓
Backend Validation
        ↓
MongoDB Atlas
        ↓
Registration Created
        ↓
verificationStatus = PENDING
```

### Admin

```text
/admin
   ↓
Enter Admin Password
   ↓
Backend Authentication
   ↓
Admin Dashboard
   ↓
Fetch Registered Teams
   ↓
View Team/Member Details
   ↓
Check GPay Payment Manually
   ↓
Set:
PENDING ↔ VERIFIED
```

Focus on simplicity, security, and reliability. This is a small college event, so avoid unnecessary enterprise-level complexity.
