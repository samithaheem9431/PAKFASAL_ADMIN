# PakFasal Admin

Admin web app for PakFasal marketplace. The **Flutter app** continues to read Firestore directly for public data; **all admin mutations** go through the Node API using the Firebase Admin SDK.

## Prerequisites

- Node.js 18+
- A Firebase project (shared with the mobile app)
- A service account key with access to Firestore, Auth, and Storage
- For each admin user, a document at `admins/{uid}` with at least: `email`, `role` (e.g. `admin`)

## Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `FIREBASE_SERVICE_ACCOUNT_KEY` to the **entire JSON** of the service account (single line), or to a **relative path** to a JSON file (e.g. `serviceAccount.json`) placed under `backend/`.
3. Optionally set `FIREBASE_STORAGE_BUCKET` to your default bucket (e.g. `project-id.appspot.com`) if uploads fail to resolve the bucket.
4. Run:

```bash
cd backend
npm install
npm run dev
```

API base URL defaults to `http://localhost:4000`.

## Frontend

1. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID` (and optional fields if your app needs them).
2. In development, the Vite dev server proxies `/api` to the backend (see `frontend/vite.config.js`), so you can leave `VITE_API_URL` empty.
3. Run:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, sign in with an account that has an `admins/{uid}` document. Non-admins are signed out with an error message.

## Firestore rules

Deploy `firestore.rules` in the Firebase console (or with Firebase CLI). The admin panel does not rely on client-side writes; these rules protect the mobile app and any direct client access.

## API summary (all require `Authorization: Bearer <Firebase ID token>` and `admins/{uid}`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/me` | Session / admin check |
| GET/POST | `/api/products` | List / create products |
| PUT/DELETE | `/api/products/:id` | Update / soft-delete |
| POST | `/api/upload` | Image upload (multipart `file`) |

## Project layout

- `frontend/src/pages` — screens
- `frontend/src/components` — layout, spinner
- `frontend/src/services` — `api.js`, `firebase.js`
- `frontend/src/routes` — `ProtectedRoute.jsx`
- `backend/src` — Express app, controllers, middleware
