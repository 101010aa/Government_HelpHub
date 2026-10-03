# Government Help Hub

A full-stack directory for public-service helplines, with source-aware listings, member accounts, REST-based conversations, and an administrator dashboard.

## Features

- Search helplines by name, number, purpose, operator, or government body; filter by category and verification status.
- Source and official website links, operator, availability, verification date, and clickable contact channels on each listing. The interface only labels a record verified when its `isVerified` field is true.
- JWT registration and sign in, account profile updates, and role protected administration.
- Admin tools for helplines, categories, accounts, and conversations. Helplines/categories are deactivated instead of destructively removed; active category dependencies prevent deactivation.
- Private participant conversations with message ownership checks, edit/delete actions, and incremental four-second message polling.
- Responsive interface with loading, empty, error, and destructive action confirmation states.

## Technology and structure

- Frontend: React, Vite, React Router, Axios, Lucide icons, responsive CSS.
- Backend: Node.js, Express, MongoDB, Mongoose, bcryptjs, JWT, Helmet, CORS, rate limits.

```text
frontend/src/{components,context,pages,services,styles.css}
backend/src/{config,controllers/{authController,directoryController,adminController,conversationController,shared},middleware,models,routes,seed}
```

## Requirements

- Node.js 20 or newer and npm.
- MongoDB running locally or a reachable MongoDB deployment.

## Setup

1. Copy `backend/.env.example` to `backend/.env` and set a long, unique `JWT_SECRET`, a MongoDB URI, and the admin credentials you want to initialize. The seed script requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
2. Install and seed the backend:

   ```sh
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

3. In another terminal, run the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`. API defaults to `http://localhost:5000/api`; set `VITE_API_URL` in the frontend environment to use a different API origin.

Production backend commands: `npm start`. Frontend production commands: `npm run build` and `npm run preview`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection URI |
| `JWT_SECRET` | Secret used to sign session tokens |
| `CLIENT_URL` | Allowed browser origin (default `http://localhost:5173`) |
| `ADMIN_NAME` | Name used for the first seeded admin |
| `ADMIN_EMAIL` | Email used for the first seeded admin |
| `ADMIN_PASSWORD` | Password used for the first seeded admin; set privately before seeding |
| `VITE_API_URL` | Optional frontend API base URL |

Never commit `.env` or use the example credentials as production credentials. The seed script creates the initial admin only if its email does not already exist and prints no credentials.

## Demo data and official information

The seed script adds directory categories, an initial administrator, and an idempotent public grievance listing using published government contact information. The listing includes hotline 1111, office phone 01-5970087, email 1111@nepal.gov.np, mobile/SMS/WhatsApp/Viber +977-9851145045, fax 1100, official social accounts, complaint and tracking channels, and the published Singhadurbar address. The official portal identifies the hotline as toll-free. Its availability includes a note that 24/7 operation was reported by the telecom provider in 2023; confirm current availability with OPMCM. Source references link the [official OPMCM grievance portal](https://gunaso.opmcm.gov.np/), its [FAQ/contact page](https://gunaso.opmcm.gov.np/faqs), the [OPMCM website](https://www.opmcm.gov.np/en), and the [telecom provider's service announcement](https://www.ncell.com.np/en/about/media-room/press-release/ncell-collaborates-with-government-to-facilitate-hello-sarkar-1111-247). The seed does not copy the portal's public complaint feed or changing statistics. Other categories remain empty until real records are added through `/admin/helplines` from reliable official sources. Mark a listing verified only after checking its source and saving a verification date.

## API overview

All API responses have `{ success, message, data }` on success, or `{ success: false, message }` on error.

| Area | Routes |
| --- | --- |
| Authentication | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/me` |
| Categories | `GET /api/categories`, admin `POST/PUT/DELETE /api/categories` |
| Helplines | `GET /api/helplines?search=&category=&verified=&page=&limit=`, `GET /api/helplines/:id`, admin `POST/PUT/DELETE /api/helplines` |
| Dashboard and users | admin `GET /api/admin/stats`, `GET /api/admin/users`, `PUT /api/admin/users/:id` |
| Conversations | authenticated `POST/GET /api/conversations`, `GET/DELETE /api/conversations/:id` |
| Messages | authenticated `GET/POST /api/conversations/:id/messages`, `PUT/DELETE /api/messages/:id` |

Pass the JWT as `Authorization: Bearer <token>`. Conversation and message reads/writes require participation, except administrators. The last active administrator cannot be deactivated. Authentication and message writes have basic rate limits.

## Polling

Opening a conversation loads the conversation and its existing messages. The browser then polls every four seconds. After the initial batch it passes the last known message ID using `?after=<messageId>` and appends only unseen messages. The interval is cleared when the room unmounts. This is a simple REST polling implementation, not a guaranteed instant or offline messaging service.

## Creating an administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` in the private backend environment before running `npm run seed`. To create another admin, an existing administrator can update a user's role from the People page. Self-demotion and removal of the last active administrator are prevented.

## Production considerations

Use HTTPS, strong secrets, private environment configuration, a restricted MongoDB account, backups, and a production frontend origin. Review privacy, retention, accessibility, and applicable government data policies before launch. Add authoritative helpline sources and a regular re-verification process. Configure trusted proxy settings/rate limits as needed when deployed behind a proxy. The directory is informational and should not imply official government endorsement unless the service owner has arranged it.
