# API Changelog

## March 2026 — Auth Hardening & New Endpoints

### ✨ New Features

- **Logout Endpoint**: Users can now explicitly terminate their session via `POST /api/auth/logout`. All active refresh tokens are revoked immediately, preventing any further session reuse.

- **Current User Endpoint**: Added `GET /api/auth/me` — authenticated clients can fetch their own profile (id, name, email) with a single request, no decoding required on the frontend.

- **Request Validation on Login**: The login endpoint now validates the request body with proper constraints, returning clear error messages instead of a generic 500 when fields are missing or malformed.

### 🔧 Improvements

- **Refresh Token Rotation**: Refresh tokens are now invalidated immediately upon use. Each call to `POST /api/auth/refresh-token` issues a new token pair and voids the old one, limiting the damage window if a token is ever leaked.

- **Consistent Auth Guards**: Protected endpoints (`/logout`, `/me`) now correctly enforce JWT authentication. Previously, these routes would crash with an internal server error when called — they now return a proper `401 Unauthorized` when the token is missing or invalid.

### 🐛 Bug Fixes

- **Login crash on unknown email**: Attempting to log in with an email that doesn't exist in the database previously caused an unhandled `TypeError` (resulting in a 500 response). The check is now performed before accessing the user's credentials, returning a clean `400 Bad Request` instead.

- **Logout crash on missing user**: Calling logout with a token whose user no longer exists in the database would throw a `TypeError`. The operation now exits gracefully without an error.

---

## February–March 2026 — Initial Release

### ✨ New Features

- **User Authentication**: Complete authentication system with secure user registration, login, and session management. Users can now create accounts and securely access protected resources.

- **Token Management**: JWT-based authentication with access and refresh token support. Sessions stay active without requiring frequent re-logins while maintaining security.

- **Website Crawler**: New crawler module for processing website crawling jobs. Queue-based architecture ensures reliable and scalable crawling operations.

### 🔧 Improvements

- **API Documentation**: Integrated Swagger documentation for easier API exploration and testing. Developers can browse and test all endpoints interactively at `/docs`.

- **Rate Limiting**: Added request throttling to protect the API from abuse and ensure fair usage across all clients.

- **Better Error Handling**: Centralized error handling provides consistent, informative error responses across all endpoints.

- **Health Monitoring**: Health check endpoints including liveness probes for better infrastructure monitoring and container orchestration.

- **Database Integration**: TypeORM configuration with PostgreSQL support and migration tooling for schema management.

### 🔒 Security

- **Password Security**: Passwords are securely hashed using bcrypt before storage — plaintext passwords are never persisted.

- **Token Validation**: JWT strategy implementation ensures secure token validation for all protected routes.

- **Separate Token Secrets**: Access and refresh tokens use independent signing secrets, limiting the blast radius if one is compromised.

### 🏗️ Infrastructure

- **Redis Integration**: Added Redis support for background job queuing and session infrastructure.

- **Background Jobs**: BullMQ integration enables reliable async job processing for crawler operations.

- **Performance Testing**: K6 stress testing scripts added to evaluate API performance under load.

- **CI/CD Pipeline**: GitHub Actions workflow for automated testing and build validation on every push.
