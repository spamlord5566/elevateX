# Developer Notes

## Environment

Public frontend: create `elevateX-fe/.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

Admin frontend: create `elevateX-admin/.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

Backend: create `elevateX-be/.env` with values for:

```env
PORT=5000
MONGODB_URI=<mongodb-atlas-connection-string>
ADMIN_PASSWORD=<strong-admin-password>
DEFAULT_REGISTRATION_FEE=200
```

Email actions also require the SMTP variables read by `elevateX-be/services/emailService.js`. Keep all secrets in environment files and out of source control. `ADMIN_PASSWORD` must never use a `NEXT_PUBLIC_` prefix.

## Local Development

```bash
# Backend
cd elevateX-be
npm install
npm run dev

# Public frontend
cd elevateX-fe
npm install
npm run dev

# Admin frontend
cd elevateX-admin
npm install
npm run dev
```

The frontend calls the backend through `NEXT_PUBLIC_APP_URL`. The backend connects to MongoDB before listening on port 5000.

## Data Flow

1. The registration modal collects team, leader, participant, and payment-screenshot data.
2. `elevateX-fe/src/lib/api.ts` sends the form as multipart data to `POST /api/register`.
3. The backend validates fields, participant count, image content, and duplicate email addresses.
4. MongoDB stores the registration and the fee that applied at submission time.
5. An admin reviews the uploaded payment screenshot and changes the verification status.

Teams contain one leader and zero to three additional participants. Each participant requires a name, email, and phone number. Supported tracks are `ai-ml`, `web3`, `open-innovation`, `sustainability`, `fintech`, and `healthtech`.

## Admin Authentication

`POST /api/admin/login` compares the supplied password with the backend-only `ADMIN_PASSWORD` environment variable and returns a session token. Protected admin requests must send that token as a bearer token. The admin frontend keeps the token in `sessionStorage`; it is not a substitute for backend authorization.

## Verification and Email Rules

The backend accepts only `Pending Verification`, `Verified`, and `Rejected`. Rejections require a reason. A verified registration cannot be rejected, and a rejected registration cannot be verified. Verification and rejection emails can be sent once when the registration has the matching status.

## Useful Checks

```bash
# Frontend
npm run type-check
npm run build

# Backend
cd elevateX-be
npm start
```
