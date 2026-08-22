# Elevate College Event Website — Backend Project Context

## 1. Project Overview

We are building a college event website called **Elevate**.

There are two developers:

- **Frontend:** My friend is responsible for the existing Next.js frontend.
- **Backend:** I am responsible for the registration backend, validation, security, and MongoDB Atlas database.

### Existing Frontend Repository

GitHub repository:

https://github.com/spamlord5566/elevateX

The frontend is already implemented to some extent and contains an API abstraction layer at:

```text
src/lib/api.ts
```

It also has an existing multi-step registration flow and mock API behaviour.

The backend should be designed around the **actual frontend fields and API expectations**, rather than guessing them.

---

# 2. Backend Scope

My backend responsibility is specifically:

1. Collect student registration details.
2. Validate registration data.
3. Prevent duplicate registrations.
4. Store registrations in MongoDB Atlas.
5. Provide clean REST APIs for the frontend.
6. Handle errors properly.
7. Implement basic backend security.
8. Configure CORS correctly.
9. Keep secrets in environment variables.
10. Make the backend ready for deployment.

### Out of Scope

Certificate functionality is **not part of my backend work**.

Do NOT implement:

- Certificate generation
- Certificate PDF creation
- Certificate email delivery
- Certificate verification
- Certificate models
- Certificate administration

Certificate handling will be added separately by my friend through a protected/secret `/admin` route.

Do not design the current backend around certificate functionality.

---

# 3. Recommended Repository Structure

The repository should eventually look like:

```text
elevateX/
├── src/                  # Existing Next.js frontend
├── public/
├── package.json
│
└── backend/              # My Express backend
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── registrationController.js
    ├── middleware/
    │   ├── errorMiddleware.js
    │   └── validationMiddleware.js
    ├── models/
    │   └── Registration.js
    ├── routes/
    │   └── registrationRoutes.js
    ├── utils/
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── server.js
```

Do not put the Express backend inside the frontend's `src/` directory.

---

# 4. Technology Stack

Use:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- CORS

Additional security packages may be used where useful, such as:

- helmet
- express-rate-limit
- express-validator or another validation library

Keep the implementation simple and understandable.

Do not add unnecessary packages.

---

# 5. Main Architecture

```text
              ELEVATE WEBSITE

             Next.js Frontend
                    │
                    │ API request
                    ↓
              src/lib/api.ts
                    │
                    │ HTTP
                    ↓
             Express Backend
                    │
             Validation
                    │
                    ↓
             MongoDB Atlas
                    │
                    ↓
          Registration Collection
```

The frontend must **never connect directly to MongoDB**.

All database operations must go through the Express API.

---

# 6. Main Registration Flow

The desired flow is:

```text
Student fills registration form
             ↓
Next.js frontend
             ↓
POST /api/registrations
             ↓
Express
             ↓
Validate request
             ↓
Check duplicate registration
             ↓
Save to MongoDB Atlas
             ↓
Return success response
             ↓
Frontend displays confirmation
```

---

# 7. Important Development Rule

**Do not design the backend blindly.**

Before creating the final MongoDB schema:

1. Inspect the existing frontend.
2. Inspect `src/lib/api.ts`.
3. Inspect the registration modal/component.
4. Inspect frontend types/interfaces.
5. Inspect mock API functions.
6. Identify exactly what information the registration form collects.
7. Design the Mongoose schema around those actual fields.
8. Design the API request body to match the frontend.

If the frontend already has a field name such as `fullName`, do not arbitrarily rename it to `name` unless there is a good reason.

---

# 8. Registration Data

The exact registration fields must come from the existing Elevate frontend.

Possible fields might include:

```text
name
email
phone
college
department
year
teamName
track
```

These are examples only.

**Do not assume these are the final fields.**

Inspect the frontend first.

Only store information that is actually required by the event.

Avoid collecting unnecessary personal information.

---

# 9. MongoDB Registration Collection

Use a Mongoose model such as:

```text
Registration
```

A conceptual structure could be:

```text
Registration
├── name
├── email
├── phone
├── college
├── department
├── year
├── teamName
├── track
├── createdAt
└── updatedAt
```

The actual fields must match the frontend.

Use:

- Required fields where appropriate
- Correct data types
- Unique constraints where appropriate
- Timestamps
- Indexes where useful

For example, if email is the unique registration identifier:

```javascript
email: {
    type: String,
    required: true,
    unique: true
}
```

However, the exact uniqueness rule should depend on the event's registration requirements.

---

# 10. Input Validation

Validation must happen on the **backend**, even if the frontend already validates the form.

Never trust frontend validation.

Validate:

### Required fields

Reject missing required fields.

### Email

Check:

- Correct format
- Normalization where appropriate

For example:

```text
Student@Gmail.com
```

may be normalized to:

```text
student@gmail.com
```

if the project decides to treat emails case-insensitively.

### Phone

Validate the expected phone format and length if phone is required.

### Strings

Prevent:

- Unexpected empty strings
- Excessively long values
- Obviously malformed input

### Enumerated fields

If a field such as `year` or `track` has predefined options, validate against the allowed values.

---

# 11. Duplicate Registration Prevention

The backend must prevent duplicate registrations.

A good approach is:

```text
Frontend request
      ↓
Normalize email
      ↓
Check existing registration
      ↓
If exists → return 409 Conflict
      ↓
If not → create registration
```

Also use a MongoDB unique index where appropriate.

Do not rely only on:

```javascript
if (!existingUser) {
    createUser();
}
```

because simultaneous requests can still create duplicates.

Use the database constraint as the final protection.

---

# 12. Registration API

The main endpoint should be:

```http
POST /api/registrations
```

Potential supporting endpoints:

```http
GET /api/registrations/:id
```

Only expose this if the frontend actually needs it.

Avoid creating unnecessary public endpoints.

### Example Request

The actual request must match the frontend.

Conceptually:

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "phone": "9876543210",
  "college": "Example College",
  "department": "CSE",
  "year": 3
}
```

### Success

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "registrationId": "..."
  }
}
```

Do not return unnecessary database information.

### Duplicate

Use:

```text
409 Conflict
```

Example:

```json
{
  "success": false,
  "message": "This email is already registered"
}
```

### Validation Error

Use:

```text
400 Bad Request
```

Example:

```json
{
  "success": false,
  "message": "Invalid registration details"
}
```

---

# 13. Security

The registration endpoint is public, so it should be protected against basic abuse.

Implement appropriate measures such as:

### Environment Variables

Never hardcode:

- MongoDB URI
- API keys
- Secrets
- Passwords

Use:

```env
MONGODB_URI=
PORT=5000
```

### `.gitignore`

Ensure:

```text
.env
node_modules/
```

are ignored.

### CORS

During development, allow the local frontend origin.

For production, allow only the actual Elevate frontend domain.

Do not blindly use:

```javascript
origin: "*"
```

in production.

### Helmet

Use Helmet where appropriate to add common HTTP security headers.

### Rate Limiting

Consider rate limiting the public registration endpoint to prevent spam/abuse.

For example:

```text
POST /api/registrations
```

should not be allowed to receive unlimited requests from one client.

### Input Sanitization

Do not blindly trust request body values.

Validate length, format, and allowed values.

### Error Responses

Do not expose:

- Stack traces
- MongoDB errors
- Connection strings
- Internal file paths
- Secrets

to the client.

---

# 14. Error Handling

Use centralized Express error handling.

Handle:

```text
Invalid input
Duplicate registration
MongoDB connection failure
Database validation error
Unexpected server error
```

Use consistent responses.

Example:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Detailed errors can be logged on the server without being returned to users.

---

# 15. Database Connection

Create a separate database configuration file:

```text
backend/config/db.js
```

It should handle the MongoDB Atlas connection.

The server should:

```text
Start
 ↓
Connect MongoDB
 ↓
Start Express server
```

If the database connection fails, handle it clearly instead of silently running an unusable API.

---

# 16. Frontend Integration

The existing frontend has:

```text
src/lib/api.ts
```

This should be the main frontend API abstraction layer.

Conceptually:

```text
Registration Component
       ↓
src/lib/api.ts
       ↓
POST /api/registrations
       ↓
Express
       ↓
MongoDB Atlas
```

The frontend should not contain database logic.

The frontend should only send the registration data to the backend and handle the response.

---

# 17. Development Workflow

## Phase 1 — Understand Frontend

1. Clone `elevateX`.
2. Run the frontend locally.
3. Inspect `src/lib/api.ts`.
4. Inspect registration components.
5. Inspect frontend types/interfaces.
6. Inspect mock API functions.
7. Identify exact registration fields.

## Phase 2 — Backend Foundation

1. Create `backend/`.
2. Run `npm init -y`.
3. Install Express.
4. Install Mongoose.
5. Install dotenv.
6. Install CORS.
7. Add security packages if required.
8. Create Express server.
9. Connect MongoDB Atlas.

## Phase 3 — Registration

1. Create Registration model.
2. Create validation.
3. Create registration controller.
4. Create registration route.
5. Add duplicate protection.
6. Add error handling.
7. Test with Postman.

## Phase 4 — Frontend Integration

1. Replace mock registration API.
2. Connect `src/lib/api.ts` to Express.
3. Test frontend registration.
4. Test duplicate registration.
5. Test invalid input.
6. Test database errors.

## Phase 5 — Security & Deployment

1. Configure `.env`.
2. Add `.env.example`.
3. Configure CORS.
4. Add rate limiting.
5. Add Helmet.
6. Check that secrets are not committed.
7. Deploy backend.
8. Connect production frontend.

---

# 18. Testing

Use Postman before relying completely on the frontend.

Test:

### Valid Registration

```text
POST /api/registrations
```

with valid data.

Expected:

```text
201 Created
```

### Duplicate Registration

Submit the same email again.

Expected:

```text
409 Conflict
```

### Missing Fields

Expected:

```text
400 Bad Request
```

### Invalid Email

Expected:

```text
400 Bad Request
```

### Invalid Field Values

Expected:

```text
400 Bad Request
```

### Excessively Large Input

Expected:

```text
400 Bad Request
```

### Database Failure

Expected:

```text
500 Internal Server Error
```

without exposing internal database information.

### Rate Limiting

Send repeated requests and verify that excessive requests are rejected.

---

# 19. Git Workflow

Since the frontend already exists in GitHub, use a separate backend branch while developing:

```bash
git checkout -b backend
```

Example commits:

```text
feat: initialize express backend
feat: add mongodb connection
feat: add registration model
feat: add registration validation
feat: add registration api
feat: prevent duplicate registrations
feat: add error handling
feat: add api security
```

Coordinate with the frontend developer before merging major changes into `main`.

---

# 20. Deployment

Possible architecture:

```text
Frontend → Vercel
Backend  → Render / Railway
Database → MongoDB Atlas
```

Production backend requirements:

- Production MongoDB URI
- Correct CORS origin
- Environment variables
- No committed secrets
- Appropriate rate limiting
- Proper error handling
- HTTPS through the hosting platform

---

# 21. Master Prompt

Use the following prompt when asking an AI assistant to help develop this project:

> You are helping me develop the backend for a college event website called **Elevate**.
>
> The frontend already exists in:
>
> `https://github.com/spamlord5566/elevateX`
>
> It is a Next.js frontend with an API abstraction layer under `src/lib/api.ts`, an existing multi-step registration flow, and mock API behaviour.
>
> I am responsible for the backend.
>
> Backend stack:
>
> - Node.js
> - Express.js
> - MongoDB Atlas
> - Mongoose
> - dotenv
> - CORS
>
> Security packages such as Helmet, express-rate-limit, and a validation library may be used when appropriate.
>
> The backend will live in:
>
> `elevateX/backend/`
>
> Do not put backend code inside the frontend's `src/` directory.
>
> My backend scope is ONLY:
>
> 1. Collect student registration details.
> 2. Validate registration data.
> 3. Prevent duplicate registrations.
> 4. Store registrations in MongoDB Atlas.
> 5. Provide clean REST APIs for the Next.js frontend.
> 6. Handle errors correctly.
> 7. Implement appropriate backend security.
> 8. Configure CORS.
> 9. Keep secrets in environment variables.
> 10. Make the backend ready for deployment.
>
> Certificate functionality is OUT OF SCOPE.
>
> Do NOT implement:
>
> - Certificate generation
> - Certificate PDFs
> - Certificate emails
> - Certificate verification
> - Certificate models
> - Certificate administration
>
> Certificate functionality will be added separately by my friend through a protected/secret `/admin` route.
>
> **Important:** Before designing the MongoDB schema or API payload, inspect the existing frontend, especially:
>
> - `src/lib/api.ts`
> - Registration components
> - Frontend types/interfaces
> - Mock API functions
>
> Do not invent registration fields when the frontend already defines them.
>
> Make the backend request/response format match the existing frontend where practical.
>
> Keep the implementation beginner-friendly and avoid unnecessary complexity.
>
> Use:
>
> - async/await
> - Mongoose validation
> - Backend input validation
> - MongoDB unique constraints where appropriate
> - Centralized error handling
> - Proper HTTP status codes
> - Secure environment variables
> - Appropriate CORS
> - Rate limiting where useful
> - Helmet where useful
>
> Do not expose database errors, stack traces, secrets, or internal implementation details to users.
>
> The desired architecture is:
>
> ```text
> Next.js
>    ↓
> src/lib/api.ts
>    ↓
> Express API
>    ↓
> Validation
>    ↓
> MongoDB Atlas
> ```
>
> Help me build the backend incrementally.
>
> First inspect the frontend and determine the exact registration data structure. Then build the MongoDB model and registration API. Do not move on to unnecessary features until registration works correctly end-to-end.

---

# 22. Immediate Next Step

The next task should be:

```text
1. Clone elevateX
2. Create backend/
3. Run the frontend and inspect it
4. Open src/lib/api.ts
5. Inspect the registration modal/components
6. Identify the exact registration payload
7. Initialize the Express backend
8. Connect MongoDB Atlas
9. Create the Registration model
10. Create POST /api/registrations
11. Add validation
12. Add duplicate protection
13. Test with Postman
14. Connect the frontend
```

The project should remain focused on **securely collecting and storing Elevate registrations**.
