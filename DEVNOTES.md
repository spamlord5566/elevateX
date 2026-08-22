# Frontend Developer Notes (DEVNOTES)

Hey! Here are the details about the newly implemented Express.js backend, recent architectural updates (such as student login removal), and how to connect the Next.js frontend to it.

---

## 🚀 Local Development Setup

To run the full stack locally:

1. **Start the Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   The backend server runs on **`http://localhost:5000`** and connects to the MongoDB Atlas cluster.

2. **Start the Frontend**:
   At the root directory (`/`):
   ```bash
   npm run dev
   ```
   The Next.js dev server runs on **`http://localhost:3000`**.

3. **Configure Environment Variables**:
   In the root frontend directory, create a `.env.local` file (already created for you locally) and specify the backend endpoint URL:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:5000
   ```

---

## 🔄 Recent Changes

### 1. Student Login Removal
* **No Accounts Required**: Student login, signup, password management, and personal dashboards have been completely removed.
* **Streamlined Flow**: Students directly fill the registration form on the homepage and submit. The system registers them immediately and generates a team ID, setting their payment verification status to `PENDING` by default.
* **Cleaned Pages**: The `/login` and `/dashboard` directories have been deleted, and the links have been removed from the navigation bar.

### 2. Admin Panel (`/admin`)
* **Admin Access**: A password-protected Admin Dashboard is now available at `/admin`.
* **Manual Verification**: Admins can log in, view registrations, search teams/members, and manually verify fee payments by setting the team status to `PENDING` or `VERIFIED`.

---

## 🌐 API Specifications & Endpoints

All backend endpoints are prefixed with `/api`.

### 1. Register Team
* **Endpoint**: `POST /api/register`
* **Content-Type**: `application/json`
* **Request Body Payload**:
  ```json
  {
    "teamName": "Nebula Team",
    "trackId": "ai-ml",
    "leaderName": "Achyuth",
    "leaderEmail": "achyuth@example.com",
    "members": [
      {
        "name": "Bob",
        "email": "bob@example.com"
      }
    ]
  }
  ```
  *Note: A team must have exactly 1 leader, and between 0 and 3 additional members (maximum team size of 4 total).*

* **Successful Response** (`201 Created`):
  ```json
  {
    "success": true,
    "teamId": "TM-3990",
    "message": "Team \"Nebula Team\" registered successfully!"
  }
  ```

* **Error Responses**:
  * **`400 Bad Request`**: Validation failure (e.g. invalid emails, empty strings, team size > 4, or duplicate emails *within* the payload).
    ```json
    {
      "success": false,
      "message": "Team name must be at least 2 characters"
    }
    ```
  * **`409 Conflict`**: Duplicate registration (e.g., if the leader's email, or any member's email, is already registered in another team in the database).
    ```json
    {
      "success": false,
      "message": "One or more email addresses in your team are already registered."
    }
    ```

---

### 2. Fetch Tracks
* **Endpoint**: `GET /api/tracks`
* **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "ai-ml",
        "name": "AI & Machine Learning",
        "description": "...",
        "icon": "🤖",
        "color": "#d4f000",
        "maxTeamSize": 4,
        "prizePool": "₹1,00,000",
        "tags": ["Python", "TensorFlow", "PyTorch", "LLMs"]
      }
    ]
  }
  ```

---

### 3. Admin Login
* **Endpoint**: `POST /api/admin/login`
* **Content-Type**: `application/json`
* **Request Body Payload**:
  ```json
  {
    "password": "elevate@123"
  }
  ```
* **Successful Response** (`200 OK`):
  ```json
  {
    "success": true,
    "token": "a1b2c3d4...",
    "message": "Logged in successfully"
  }
  ```
* **Error Response** (`401 Unauthorized`):
  ```json
  {
    "success": false,
    "message": "Invalid admin password"
  }
  ```

---

### 4. Fetch All Registrations (Admin Only)
* **Endpoint**: `GET /api/admin/registrations`
* **Headers**: `Authorization: Bearer <admin_token>`
* **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6a89a234...",
        "teamId": "TM-3990",
        "teamName": "Nebula Team",
        "trackId": "ai-ml",
        "leaderName": "Achyuth",
        "leaderEmail": "achyuth@example.com",
        "members": [
          { "name": "Bob", "email": "bob@example.com" }
        ],
        "verificationStatus": "PENDING",
        "createdAt": "2026-08-22T13:20:52.448Z",
        "updatedAt": "2026-08-22T13:20:52.448Z"
      }
    ]
  }
  ```

---

### 5. Update Verification Status (Admin Only)
* **Endpoint**: `PATCH /api/admin/registrations/:id/verification`
* **Headers**: `Authorization: Bearer <admin_token>`
* **Request Body Payload**:
  ```json
  {
    "status": "VERIFIED"
  }
  ```
  *Note: Accepted status values are only `"PENDING"` or `"VERIFIED"`.*

* **Successful Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Status updated to VERIFIED",
    "data": { ... }
  }
  ```

---

## 🛠 Frontend API Implementation details

The client-side API integrations are centralized in [`src/lib/api.ts`](file:///c:/elevateX/src/lib/api.ts). It retrieves settings from `process.env.NEXT_PUBLIC_APP_URL` and formats return payloads appropriately. No additional frontend edits are needed to consume the real API.
