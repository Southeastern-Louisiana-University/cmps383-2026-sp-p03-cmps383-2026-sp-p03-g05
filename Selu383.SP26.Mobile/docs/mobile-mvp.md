# Mobile MVP (Step 1)

This MVP is intentionally aligned to the backend that already exists in `Selu383.SP26.Api`.

## Scope

1. Authentication flow using:
   - `POST /api/authentication/login`
   - `GET /api/authentication/me`
   - `POST /api/authentication/logout`
2. Location browsing:
   - `GET /api/locations`
   - `GET /api/locations/{id}`
3. Manager/Admin location updates:
   - `PUT /api/locations/{id}`

## Roles

- `Admin`: can create users and manage any location.
- `User` with `ManagerId` ownership: can update assigned location.
- Unassigned users: read-only location browsing.

## Out of Scope for MVP

- Payments
- Cart and checkout
- Order history
- Push notifications
- Loyalty/rewards

## Done Criteria

- User can sign in and persist session.
- App loads current user and role state on launch.
- App shows location list and detail.
- Authorized users can update location fields.
