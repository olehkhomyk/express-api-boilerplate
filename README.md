# Express Mongo TS Boilerplate

A production-minded starter for REST APIs on **Node.js + Express 5 + MongoDB + TypeScript**.
The goal is a fast start for any new backend: clone it, add a module, ship.

> 🚧 Work in progress. The architecture is being refined step by step; see [Roadmap](#roadmap).

## Stack

| Concern    | Tool                                                  |
|------------|-------------------------------------------------------|
| Runtime    | Node.js 24 (ESM)                                      |
| HTTP       | Express 5 (native async error handling)               |
| Database   | MongoDB + Mongoose 9                                  |
| Validation | Zod 4 (requests and env)                              |
| Auth       | JWT access token (`jose`) + refresh token in a cookie |
| Security   | `helmet`, `cors`, `connect-timeout`                   |
| Logging    | Pino + pino-http (+ pino-pretty in dev)               |
| Language   | TypeScript (strict), `tsx` for dev                    |

## Getting started

```bash
npm install
docker compose up -d        # MongoDB on localhost:27017 (or use a local mongod)
# create .env with the variables below
npm run dev                 # tsx watch, restarts on change
```

| Script          | What it does                        |
|-----------------|-------------------------------------|
| `npm run dev`   | Run `src/server.ts` with hot reload |
| `npm run build` | Compile TypeScript to `dist/`       |
| `npm start`     | Run the compiled `dist/server.js`   |

> ⚠️ `npm start` runs the **compiled** code. After changing `src/`, run `npm run build` first, or you will be testing
> stale code.

> ⚠️ `tsx watch` does not restart on `.env` changes. Restart the dev server manually after editing `.env`.

### Environment variables

All variables are validated on startup in `src/config/env.ts`. With a missing or invalid value the app **refuses to
start** and prints every problem at once. Nothing else in the code reads `process.env`; import `env` instead.

| Variable                | Default       | Example / allowed values                                                 | Purpose                                             |
|-------------------------|---------------|--------------------------------------------------------------------------|-----------------------------------------------------|
| `NODE_ENV`              | `development` | `development` \| `production` \| `test`                                  | Runtime environment                                 |
| `PORT`                  | `3000`        | `3000`                                                                   | HTTP port                                           |
| `LOG_LEVEL`             | `info`        | `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal` \| `silent` | Log verbosity (**not** the environment)             |
| `MONGO_URI`             | —             | `mongodb://root:password@127.0.0.1:27017/node_api?authSource=admin`      | MongoDB connection string                           |
| `JWT_ACCESS_SECRET`     | —             | 32+ random characters                                                    | Signs access tokens                                 |
| `JWT_ACCESS_EXPIRES_IN` | `15m`         | `15m`, `1h`, `7d`                                                        | Access token lifetime                               |
| `REQUEST_TIMEOUT_MS`    | `30000`       | `30000`                                                                  | Max time to respond; after it the client gets 503   |
| `TRUST_PROXY`           | `0`           | `0`, `1`                                                                 | Number of proxies in front of the app (0 = none)    |
| `CORS_ORIGINS`          | `*`           | `http://localhost:5173,https://app.site.com`                             | Browser origins allowed to call the API (`*` = any) |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Project structure

```
src/
├── server.ts              # Entry point: connect DB → listen
├── app.ts                 # Express app: middleware order + routers
├── config/
│   ├── env.ts             # Validated env (single source of truth)
│   └── database.ts        # Mongoose connection
├── routes/
│   └── index.ts           # Mounts module routers under /api/v1
├── common/                # Reusable tools, not tied to any module
│   ├── auth/              # User roles
│   ├── errors/            # AppError + subclasses, error normalizer, error / 404 handlers
│   ├── http/              # HTTP status enum, API prefix
│   ├── logger/            # Root logger, HTTP logger, request context
│   ├── security/          # JWT, password hashing, refresh tokens, authenticate / authorize
│   ├── types/             # Shared utility types, Express augmentation (req.user)
│   └── validation/        # Request validator middleware, shared Zod schemas
└── modules/               # Business features, one folder per feature
    ├── auth/              # register, login, refresh, logout, sessions
    └── users/             # user CRUD
```

### Where does a file go?

Ask: **"What is this file about?"**

| It is about…                                | Put it in           | Test                                         |
|---------------------------------------------|---------------------|----------------------------------------------|
| A specific business entity (users, orders…) | `modules/<name>/`   | Knows about a domain concept                 |
| A generic tool                              | `common/`           | Could be copied to another project unchanged |
| Wiring and starting *this* app              | `src/` root folders | `app.ts`, `server.ts`, `config/`, `routes/`  |

Rules:

- **Has an endpoint → module. A tool other modules use → `common`.**
- `common` **never imports** from `modules`. Dependencies point one way: `modules → common`.
- Modules may use each other one way only (`auth → users`, never back), and only through the other module's service
  and DTOs, not its model.
- Group by **topic**, not by file type. No generic `middleware/`, `utils/` or `constants/` dumping grounds; constants
  live next to the code that uses them (`auth.constants.ts`).

## Request lifecycle

```
Request
  → trust proxy          real client IP behind a proxy (TRUST_PROXY)
  → loggerMiddleware     assigns reqId (UUID), sets X-Request-Id header, logs one line on finish
  → requestContext       puts req.log into AsyncLocalStorage → getLogger() works anywhere
  → timeout              503 if no response within REQUEST_TIMEOUT_MS
  → helmet, cors         security headers, allowed browser origins
  → cookieParser, express.json()
  → /api/v1 router
      → authenticate / authorize   JWT → req.user, role check
      → validateReq(schema)        Zod: replaces body / params / query with parsed data → 400 on failure
      → controller                 HTTP in/out only
      → service                    business logic, throws AppError subclasses
      → model                      Mongoose
  → notFoundHandler      unknown route → 404
  → appErrorHandler      normalizes any error into the API error format
Response
```

### Layer responsibilities

| Layer          | Does                                                                  | Does not                                 |
|----------------|-----------------------------------------------------------------------|------------------------------------------|
| **routes**     | Maps URL + method → auth → validator → controller                     | Contain logic                            |
| **validation** | Zod schemas for `body`/`params`/`query`, exports inferred types       | Touch the database                       |
| **controller** | Reads `req`, calls the service, sets status and cookies, sends DTO    | Business logic, logging, try/catch       |
| **service**    | Business rules, DB access, throws domain errors, logs business events | Know about `req`/`res`                   |
| **model**      | Mongoose schema + inferred types                                      | Business logic                           |
| **dto**        | Maps a DB document → public API shape (`toUserDTO`)                   | Leak internal fields (`passwordHash`, …) |

## Validation

`validateReq(schema)` parses `{ body, params, query }` and **replaces** them on `req` with the parsed result. Fields
that are not in the schema are dropped, so a client cannot sneak in `roles` or `passwordHash` (mass assignment).
Zod transforms (`.trim()`, `.toLowerCase()`, defaults) are applied too.

Every route that reads `body`, `params` or `query` must have `validateReq`: the `Request<…>` generics in a controller
are a promise to TypeScript, not a runtime check.

## Authentication and authorization

| Token   | Format        | Lifetime | Stored                                           | Sent                          |
|---------|---------------|----------|--------------------------------------------------|-------------------------------|
| Access  | JWT (`HS256`) | 15m      | Client memory                                    | `Authorization: Bearer …`     |
| Refresh | Random string | 30 days  | `httpOnly` cookie; SHA-256 hash in `AuthSession` | Automatically, `/auth/*` only |

- **Rotation**: every refresh deletes the old session (`findOneAndDelete`, atomic) and issues a new pair, so a refresh
  token works exactly once.
- **Cleanup**: a TTL index on `AuthSession.expiresAt` makes MongoDB delete expired sessions by itself.
- The access token carries `sub` and `roles`. On refresh, roles are re-read from the DB, so role changes apply at the
  next refresh.
- `authenticate` verifies the JWT and sets `req.user`; `authorize(UserRole.ADMIN)` checks roles.
- Profile schemas never contain `roles`. Role management, when added, gets its **own admin-only endpoint** with its
  own schema (e.g. `PUT /users/:id/roles`).

## Error handling

- Services **throw**; they do not return error objects and do not send responses.
- Expected errors extend `AppError` (`status`, `code`, `message`, optional `details` / `cause`), e.g. `NotFoundError`,
  `ConflictError`, `ValidationError`. `HttpError` is the generic class for infrastructure cases only.
- Express 5 forwards rejected promises to the error handler automatically, so **no try/catch just to rethrow**.
  Use try/catch only when you *do* something: translate a known error, retry, fall back, or clean up.

`normalizeError` translates known third-party errors, so every error leaves the API in the same format:

| Source                          | Response                           |
|---------------------------------|------------------------------------|
| `AppError`                      | its own status and code            |
| `ZodError`                      | 400 `VALIDATION_ERROR` + `details` |
| Mongo duplicate key (`E11000`)  | 409 `CONFLICT` + field names       |
| Mongoose `ValidationError`      | 400 `VALIDATION_ERROR` + `details` |
| Mongoose `CastError`            | 400 `VALIDATION_ERROR`             |
| Malformed JSON / body too large | 400 `INVALID_JSON` / 413           |
| Request timeout                 | 503 `REQUEST_TIMEOUT`              |
| Anything else                   | 500 `INTERNAL_SERVER_ERROR`        |

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "requestId": "0dab4c34-4e81-4763-9da4-432431c0e0e9",
    "details": [{ "field": "body.email", "message": "Invalid email address" }]
  }
}
```

- `details` is **public**: put only client-safe data there (fields, limits). Internal info goes to `cause`, which is
  logged but never sent.
- The `requestId` matches the `X-Request-Id` header and the `reqId` field in the logs, so one ID from a user's bug
  report finds every log line of that request.
- Clients should rely on `code`, not on `message`.

## Logging

- **Prod**: JSON lines to stdout, meant for a log collector (Loki, Datadog, ELK). The app never writes log files.
- **Dev**: pretty, colored, single-line output via `pino-pretty`.
- Every request produces **one access line**: `POST /api/v1/users 201 11ms`.
- Stack traces are logged for 5xx only; 4xx get the access line without a stack.
- Every log line inside a request carries the same `reqId`, via `AsyncLocalStorage` (see
  `common/logger/request-context.ts`).

How to log:

```ts
import { getLogger } from '../../common/logger/request-context.js';

getLogger().info({ userId: user.id }, 'User created');
```

| Do                                                                 | Don't                                            |
|--------------------------------------------------------------------|--------------------------------------------------|
| Log state changes (create / update / delete) in services           | Log reads; the access line already covers them   |
| Object first, **constant** message: `({ userId }, 'User created')` | `` `User ${id} created` ``                       |
| IDs only                                                           | Emails, names, passwords, full request bodies    |
| `getLogger()`                                                      | `console.log`, the root `logger` inside requests |
| Let errors reach the error handler                                 | Log an error and rethrow it (duplicate logs)     |

Levels: `fatal` process is dying · `error` someone must look · `warn` unusual but handled · `info` key events · `debug`
dev details.

## Code style

- **ESM** with explicit `.js` extensions in relative imports (required by `NodeNext`).
- **Tabs**, single quotes, semicolons, trailing commas.
- File names: `<module>.<layer>.ts` inside modules (`user.service.ts`), kebab-case elsewhere (`error-handler.ts`).
- URL paths in kebab-case (`/auth/refresh-token`); JSON fields and query params in camelCase.
- **Named exports**; services are imported as a namespace: `import * as userService from './user.service.js'`.
- `import type` for type-only imports; `type` over `interface`; `as const` objects over TS `enum`.
- Types come from their source of truth instead of being hand-written:
    - request types: `z.infer<typeof schema>` in `*.validation.ts`
    - document types: `InferSchemaType` in `*.model.ts`
- Explicit return types on exported functions (`Promise<UserDTO>`).
- Use the `HttpStatus` enum instead of numeric status codes.
- `find*` returns `null` when nothing is found; `get*` throws `NotFoundError`.

## Adding a new module

1. Create `src/modules/<name>/` with `routes`, `validation`, `controller`, `service`, `model`, `dto`
   (+ `constants` if needed).
2. Define Zod schemas and export the inferred types; add `validateReq` to every route that reads input.
3. Map documents to DTOs; never return raw Mongoose documents.
4. Throw `AppError` subclasses from the service; add a new subclass in `common/errors/` if needed.
5. Mount the router in `src/routes/index.ts`, with `authenticate` if the module is private.

## API

Base URL: `/api/v1`

| Method   | Path                  | Access         | Description                                                                        |
|----------|-----------------------|----------------|------------------------------------------------------------------------------------|
| `POST`   | `/auth/register`      | public         | Create an account → `{ user, accessToken, accessTokenExpiresIn }` + refresh cookie |
| `POST`   | `/auth/login`         | public         | Log in → `{ user, accessToken, accessTokenExpiresIn }` + refresh cookie            |
| `POST`   | `/auth/refresh-token` | refresh cookie | New token pair → `{ accessToken, accessTokenExpiresIn }` + new cookie              |
| `POST`   | `/auth/logout`        | refresh cookie | Delete the session and clear the cookie                                            |
| `GET`    | `/users`              | authenticated  | List users                                                                         |
| `GET`    | `/users/:id`          | authenticated  | Get a user by ID                                                                   |
| `POST`   | `/users`              | admin          | Create a user                                                                      |
| `PUT`    | `/users/:id`          | admin          | Update a user                                                                      |
| `DELETE` | `/users/:id`          | admin          | Delete a user                                                                      |

`accessTokenExpiresIn` is in seconds (like OAuth `expires_in`).

## Roadmap

Security and bugs:

- [ ] Rate limit on `/auth/*` (brute force; each scrypt hash takes 128 MB of memory)
- [ ] `GET /users` and `GET /users/:id` expose every user's email to any logged-in user: admin-only or a public DTO
- [ ] Handle `listen` errors in `server.ts` (on a busy port the process currently hangs silently)
- [ ] Constant-time login: run `verifyPassword` against a dummy hash when the user doesn't exist (email enumeration)
- [ ] `updateUserSchema.email` should be `z.email()`
- [ ] `validateReq`: `defineProperty` with `configurable: true, writable: true` (a second validator would throw)

Consistency:

- [ ] Status codes: `201` for `POST /users`, `204` for `DELETE /users/:id` and `logout`
- [ ] `auth` should go through `userService` instead of `UserModel`; `register` duplicates `createUser`
- [ ] Remove unused `getByEmail` and the leftover `@types/pino`, `@types/pino-http`
- [ ] Naming: `errors/utills/` → `errors/`, `not-found-hendler` → `not-found-handler`, `common/auth/` →
  `common/security/`,
  `auth.router.ts` → `auth.routes.ts`, `name` in `package.json`

Before the first deploy:

- [ ] Graceful shutdown (SIGTERM → close server and DB), `/health` and `/ready`
- [ ] Replace `console.log` in `server.ts` / `database.ts` with the logger
- [ ] Restrict `CORS_ORIGINS` (currently `*`)

Before reusing the template in a new project:

- [ ] Tests (Vitest + supertest), ESLint + Prettier, CI
- [ ] `.env.example`, pin Node version (`engines`, `.nvmrc`)

Later, when needed:

- [ ] Pagination for list endpoints
- [ ] Refresh token reuse detection (revoke all sessions of a user)
- [ ] `userId` in the log context after `authenticate`
