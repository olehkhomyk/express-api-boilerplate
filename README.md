# Express Mongo TS Boilerplate

A production-minded starter for REST APIs on **Node.js + Express 5 + MongoDB + TypeScript**.
The goal is a fast start for any new backend: clone it, add a module, ship.

> 🚧 Work in progress. The architecture is being refined step by step; see [Roadmap](#roadmap).

## Stack

| Concern    | Tool                                    |
|------------|-----------------------------------------|
| Runtime    | Node.js 24 (ESM)                        |
| HTTP       | Express 5 (native async error handling) |
| Database   | MongoDB + Mongoose 9                    |
| Validation | Zod 4                                   |
| Logging    | Pino + pino-http (+ pino-pretty in dev) |
| Language   | TypeScript (strict), `tsx` for dev      |

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

### Environment variables

| Variable    | Example                                                                  | Purpose                                 |
|-------------|--------------------------------------------------------------------------|-----------------------------------------|
| `PORT`      | `3000`                                                                   | HTTP port                               |
| `NODE_ENV`  | `development` \| `production` \| `test`                                  | Runtime environment                     |
| `LOG_LEVEL` | `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal` \| `silent` | Log verbosity (**not** the environment) |
| `MONGO_URI` | `mongodb://root:password@127.0.0.1:27017/node_api?authSource=admin`      | MongoDB connection string               |

## Project structure

```
src/
├── server.ts              # Entry point: load env → connect DB → listen
├── app.ts                 # Express app: middleware order + routers
├── config/
│   └── database.ts        # Mongoose connection
├── routes/
│   └── index.ts           # Mounts module routers under /api/v1
├── common/                # Reusable tools, not tied to any module
│   ├── errors/            # AppError + subclasses, central error handler
│   ├── http/              # HTTP status enum
│   ├── logger/            # Root logger, HTTP logger, request context
│   ├── types/             # Shared utility types
│   └── validation/        # Request validator middleware, shared Zod schemas
└── modules/               # Business features, one folder per feature
    └── users/
        ├── user.routes.ts
        ├── user.validation.ts
        ├── user.controller.ts
        ├── user.service.ts
        ├── user.model.ts
        └── user.dto.ts
```

```
Request
  → loggerMiddleware     assigns reqId (UUID), sets X-Request-Id header, logs one line on finish
  → requestContext       puts req.log into AsyncLocalStorage → getLogger() works anywhere
  → express.json()
  → /api/v1 router
      → validateReq(schema)   Zod: body / params / query → 400 on failure
      → controller            HTTP in/out only
      → service               business logic, throws AppError subclasses
      → model                 Mongoose
  → appErrorHandler      maps errors to JSON responses
Response
```

### Layer responsibilities

| Layer          | Does                                                                  | Does not                                 |
|----------------|-----------------------------------------------------------------------|------------------------------------------|
| **routes**     | Maps URL + method → validator → controller                            | Contain logic                            |
| **validation** | Zod schemas for `body`/`params`/`query`, exports inferred types       | Touch the database                       |
| **controller** | Reads `req`, calls the service, sets status, sends DTO                | Business logic, logging, try/catch       |
| **service**    | Business rules, DB access, throws domain errors, logs business events | Know about `req`/`res`                   |
| **model**      | Mongoose schema + inferred types                                      | Business logic                           |
| **dto**        | Maps a DB document → public API shape (`toUserDTO`)                   | Leak internal fields (`passwordHash`, …) |

## Error handling

- Services **throw**; they do not return error objects and do not send responses.
- Expected errors extend `AppError` (`status`, `code`, `message`), e.g. `NotFoundError`, `ConflictError`.
- Anything that is **not** an `AppError` is treated as unexpected → `500` with a generic message.
- Express 5 forwards rejected promises to the error handler automatically, so **no try/catch just to rethrow**.
  Use try/catch only when you *do* something: translate a known error, retry, fall back, or clean up.

Error response shape:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "User with this email already exists",
    "requestId": "0dab4c34-4e81-4763-9da4-432431c0e0e9"
  }
}
```

The `requestId` matches the `X-Request-Id` header and the `reqId` field in the logs, so one ID from a user's bug report
finds every log line of that request.

## Logging

- **Prod**: JSON lines to stdout, meant for a log collector (Loki, Datadog, ELK). The app never writes log files.
- **Dev**: pretty, colored, single-line output via `pino-pretty`.
- Every request produces **one access line**: `POST /api/v1/users 201 11ms`.
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
- **Named exports**; services are imported as a namespace: `import * as userService from './user.service.js'`.
- `import type` for type-only imports.
- Types come from their source of truth instead of being hand-written:
    - request types: `z.infer<typeof schema>` in `*.validation.ts`
    - document types: `InferSchemaType` in `*.model.ts`
- Explicit return types on exported functions (`Promise<UserDTO>`).
- Use the `HttpStatus` enum instead of numeric status codes.

## Adding a new module

1. Create `src/modules/<name>/` with `routes`, `validation`, `controller`, `service`, `model`, `dto`.
2. Define Zod schemas and export the inferred types.
3. Map documents to DTOs; never return raw Mongoose documents.
4. Throw `AppError` subclasses from the service; add a new subclass in `common/errors/` if needed.
5. Mount the router in `src/routes/index.ts`.

## API

Base URL: `/api/v1`

| Method   | Path         | Description      |
|----------|--------------|------------------|
| `GET`    | `/users`     | List users       |
| `GET`    | `/users/:id` | Get a user by ID |
| `POST`   | `/users`     | Create a user    |
| `PUT`    | `/users/:id` | Update a user    |
| `DELETE` | `/users/:id` | Delete a user    |

## Roadmap

- [ ] Validate env on startup with Zod (`config/env.ts`) instead of reading `process.env` directly
- [ ] Add `.env.example`
- [ ] Enable `pino-pretty` only when `NODE_ENV=development`
- [ ] Set `res.err` only for unexpected errors (no stack traces for 4xx)
- [ ] Replace `console.log` in `server.ts` / `database.ts` with the logger
- [ ] Password hashing
- [ ] Map Mongo duplicate key (`E11000`) → 409 and Mongoose `ValidationError` → 400 in the error handler
- [ ] `201 Created` for POST, `204 No Content` for DELETE
- [ ] 404 handler for unknown routes
- [ ] Graceful shutdown (SIGTERM → close server and DB)
- [ ] Remove unused `@types/pino` and `@types/pino-http` (both packages ship their own types)
- [ ] ESLint + Prettier, tests, CI
- [ ] Pin Node version (`engines`, `.nvmrc`)
