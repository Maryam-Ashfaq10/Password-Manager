# Password Manager

A single-user, full-stack password manager for storing, searching, and retrieving
website credentials.

- **Frontend:** Vite + React + TypeScript
- **Backend:** Express + TypeScript
- **Database:** SQLite via Prisma
- **Shared types:** Zod schemas

Passwords and notes are encrypted at rest with AES-256-GCM. The master password is
never stored — only an Argon2id hash is kept for login.
