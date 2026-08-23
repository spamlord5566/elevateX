# Admin Console Specification

The admin console is the `/admin` frontend route for reviewing ElevateX registrations. It must remain separate from the public student flow.

## Required Behavior

- Show a password screen when no valid admin session exists.
- Authenticate through `POST /api/admin/login`.
- Store the returned session token in browser session storage only.
- Send the token as `Authorization: Bearer <token>` on every admin API request.
- List registrations with search, status filtering, track filtering, and refresh.
- Show team, leader, participant, fee, payment screenshot, and verification details.
- Allow an authenticated admin to update verification status, registration fee, and the appropriate email action.
- Log out by clearing the browser session token.

## Backend Contract

Protected endpoints:

```http
GET   /api/admin/registrations
GET   /api/admin/registrations/:id
GET   /api/admin/registrations/:id/payment-screenshot
PATCH /api/admin/registrations/:id/verification
POST  /api/admin/registrations/:id/send-verification-email
POST  /api/admin/registrations/:id/send-rejection-email
PATCH /api/admin/registration-fee
```

Verification updates use JSON such as:

```json
{
  "status": "Verified",
  "paymentAmountChecked": 800
}
```

The allowed statuses are `Pending Verification`, `Verified`, and `Rejected`. A rejection must include `rejectionReason`. The backend is the authority for authentication, authorization, validation, and status transitions.

## Security Rules

- Keep `ADMIN_PASSWORD` only in `elevateX-be/.env` or the deployment secret store.
- Never expose it through a `NEXT_PUBLIC_` variable or client bundle.
- Never hardcode a password or use a frontend-only admin flag.
- Do not expose registration records through a public endpoint.
- Do not add student login, student accounts, payment-gateway integration, or automatic payment verification.

Manual payment verification is the intended workflow: students upload proof, then an authenticated admin reviews it and updates the status.
