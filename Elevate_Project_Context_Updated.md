# ElevateX Project Context

ElevateX consists of separate public and admin Next.js frontends plus an Express/Mongoose backend. The public frontend communicates through `elevateX-fe/src/lib/api.ts`; the admin frontend uses `elevateX-admin/src/lib/api.ts`. Neither frontend connects directly to MongoDB.

## Current Responsibilities

The backend currently provides:

- Team registration and validation
- Duplicate participant-email protection
- MongoDB persistence through the `Registration` model
- Registration-fee configuration
- Tracks, guidelines, and leaderboard data
- Payment-screenshot upload and retrieval for admins
- Admin authentication and registration review
- Verification and rejection email actions

Certificate management is outside the current project scope.

## Registration Model

Each registration contains:

- Generated `teamId`
- `teamName` and `trackId`
- Leader name, email, and phone
- Zero to three additional members, each with name, email, and phone
- Participant count
- Fee per participant and total fee at registration time
- Payment-screenshot metadata
- Verification status and optional payment/rejection details
- `createdAt` and `updatedAt` timestamps

The maximum team size is four. Leader and member emails are normalized to lowercase and must be unique across registrations. New registrations use `Pending Verification`.

## API Flow

```text
Registration modal
        |
        v
elevateX-fe/src/lib/api.ts -- multipart POST /api/register --> Express
                                                    |
                                                    v
                                                MongoDB
```

Admin authentication starts with `POST /api/admin/login`. Subsequent admin requests use the returned bearer token and are checked by backend middleware.

## Operational Requirements

- Configure `MONGODB_URI`, `ADMIN_PASSWORD`, and `NEXT_PUBLIC_APP_URL` through environment variables.
- Keep `.env` files and uploaded payment files out of source control.
- Use the backend's Helmet, CORS, rate limiting, validation, and centralized error handling.
- Keep API names and field names aligned with the two frontend API clients and the registration modal.
- Do not introduce student authentication or payment processing unless the project scope explicitly changes.
