# Backend Routes

Express API served from the `backend` Vercel project. Canonical base URL:

`https://backend-alpha-sable-44.vercel.app/api/v1`

Unversioned aliases (`/auth`, `/events`, `/attendance`) remain mounted for older clients.

## Server setup (`app.js`)

| Step | Detail |
| ---- | ------ |
| Body parsing | `body-parser.json()` |
| Cookies | `cookie-parser()` — reads the httpOnly `token` cookie |
| CORS | Echoes caller origin, `Access-Control-Allow-Credentials: true`, methods `GET,POST,PATCH,DELETE,OPTIONS`, headers `Content-Type,Authorization` |
| Preflight | `OPTIONS` answers `204` |
| Auth mount | `/api/v1/auth` |
| Events mount | `/api/v1/events` |
| Attendance mount | `/api/v1/attendance` |
| Error middleware | `{ message }` with `error.status` (default `500`) |

## Auth endpoints (`/api/v1/auth`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/signup` | No | Create account, set httpOnly cookie, return `token` |
| POST | `/login` | No | Verify password, set httpOnly cookie, return `token` |
| POST | `/logout` | No | Clear the cookie |
| GET | `/me` | Cookie or Bearer | Session check, returns `{ email }` |
| GET | `/users` | Cookie or Bearer | List registered accounts as `{ users }` |
| POST | `/forgot-password` | No | Email a 6-digit OTP (always generic `200`) |
| POST | `/verify-otp` | No | Burn OTP, return short-lived `resetToken` |
| POST | `/reset-password` | No | Single-use `resetToken` + new password |

Signup/login validate email and min password length 6. Duplicate emails return `422` with `errors.email`.

## Event endpoints (`/api/v1/events`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | No | `{ events: Event[] }` |
| GET | `/:id` | No | `{ event: Event }` |
| POST | `/` | Cookie or Bearer | Create event (`201`) |
| PATCH | `/:id` | Cookie or Bearer | Replace event (`200`) |
| DELETE | `/:id` | Cookie or Bearer | Delete event (`200`) |

Missing/invalid session on a write returns `401 { message: "Not authenticated." }`.

Event validation: non-empty `title` and `description`, parseable `date`, `image` starting with `http`. Failures return `422` with an `errors` object.

## Attendance endpoints (`/api/v1/attendance`)

Ten fixed demo members ship with stable IDs (`demo-001` … `demo-010`). Each member has one unique QR payload: `EHU-ATTENDANCE-<id>`.

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/users` | No | Roster with `present` and `checkedInAt` for each member |
| POST | `/check-in` | No | `{ userId }` marks that member present; repeated scans keep the first time |
| POST | `/reset` | Cookie or Bearer | Clears all check-ins |

Unknown `userId` returns `404 { message: "Unknown attendance code." }`.

## Persistence

| Data | Store |
| ---- | ----- |
| Events | Upstash key `events` (array) |
| Users, OTP hashes, spent reset tokens | Upstash key `auth-data` |
| Attendance check-ins | Upstash key `attendance` |

`/users` returns only `id`, `email` and `joinedAt`. Password hashes never leave the data layer.

Local dev without Upstash env vars falls back to `backend/events.json`, `backend/auth-data.json` and `backend/attendance.json`.

## Required environment variables

| Name | Used for |
| ---- | -------- |
| `UPSTASH_REDIS_REST_URL` | Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token |
| `JWT_SECRET` | Signs session and reset tokens |
| `BREVO_API_KEY` | Sends reset OTP email |
| `BREVO_SENDER_EMAIL` | Verified Brevo sender |
| `BREVO_SENDER_NAME` | Sender display name (optional) |
| `NODE_ENV` | `production` enables `SameSite=None; Secure` cookies |

## Run locally

```bash
cd backend
npm install
node app.js
```
