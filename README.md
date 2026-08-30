# ElevateX

ElevateX is split into three independent applications: the public Next.js frontend in `elevateX-fe/`, the admin Next.js frontend in `elevateX-admin/`, and the Express/MongoDB backend in `elevateX-be/`.

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas access for the backend

## Run Locally

Install dependencies in each application:

```bash
npm install
cd ../elevateX-admin
npm install
cd ../elevateX-be
npm install
```

Create the environment files described in [DEVNOTES.md](DEVNOTES.md), then run the services in separate terminals:

```bash
# Terminal 1
cd elevateX-be
npm run dev

# Terminal 2
cd elevateX-fe
npm run dev

# Terminal 3
cd elevateX-admin
npm run dev
```

The public frontend is available at `http://localhost:3000`, the admin frontend at `http://localhost:3001`, and the backend at `http://localhost:5000`.

## Frontend Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run type-check
```

## Application Areas

- `elevateX-fe/`: public event information, registration, public assets, and public API client.
- `elevateX-admin/`: password-protected registration and payment-verification console.
- `elevateX-be/`: Express API, Mongoose models, validation, admin authentication, and payment uploads.

## Registration

The public form accepts one leader and up to three additional participants. It submits `multipart/form-data` to `POST /api/register` and requires a JPG, JPEG, PNG, or WEBP payment screenshot of at most 2 MB. Registration responses include a generated team ID and begin with `Pending Verification`.

## Backend API Summary

Public endpoints:

- `GET /health`
- `GET /api/registration-fee`
- `GET /api/tracks`
- `GET /api/guidelines`
- `GET /api/leaderboard`
- `POST /api/register`

Admin endpoints require `Authorization: Bearer <token>` after `POST /api/admin/login`:

- `GET /api/admin/registrations`
- `GET /api/admin/registrations/:id`
- `GET /api/admin/registrations/:id/payment-screenshot`
- `PATCH /api/admin/registrations/:id/verification`
- `POST /api/admin/registrations/:id/send-verification-email`
- `POST /api/admin/registrations/:id/send-rejection-email`
- `PATCH /api/admin/registration-fee`

Verification statuses are `Pending Verification`, `Verified`, and `Rejected`.
