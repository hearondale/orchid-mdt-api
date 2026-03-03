# Orchid MDT — Claude Context

## What This Is
A Mobile Data Terminal (MDT) for FiveM roleplay servers.
Officers log in via FiveM, manage civilians, vehicles, incidents, BOLOs, and dispatch calls through a Vue web app rendered in FiveM's CEF browser.

## Stack
- **Backend:** NestJS + PostgreSQL + Prisma (PrismaPg adapter) + Socket.IO + Cache Manager
- **Frontend:** Vue (in FiveM CEF browser)
- **FiveM:** TypeScript compiled to JS, runs on the game server

## Architecture
```
Server A: FiveM game server         :30120
Server B: Dedicated backend
  NestJS HTTP API                   :3000  (JWT auth, public-facing)
  NestJS WS gateway (MDT clients)   :3000  (JWT auth)
  NestJS WS gateway (FiveM)         :3001  (FIVEM_SECRET + IP whitelist)
  PostgreSQL                        :5432  (localhost only)
```

## Auth Flow
1. Player connects to FiveM → server emits `player:handshake` to backend WS :3001 with `{ key, identifier }`
2. Backend stores key in `HandshakeStore` (60s TTL, one-time use)
3. Player opens MDT → FiveM fires `mdt:requestHandshake` → server sends key back via `TriggerClientEvent('mdt:authKey')`
4. Vue calls `POST /auth/login` with key → gets JWT
5. JWT payload: `{ sub: officer.id, identifier, isAdmin, departmentId }`
6. JWT expiry: 8h

## Guard System
- `JwtGuard` — APP_GUARD #1, applied globally, skipped with `@Public()`
- `PermissionsGuard` — APP_GUARD #2, checks `officer.isAdmin || officer.permissions.includes(requiredPermission)`
- `@Permissions('manage_officers')` — decorator for route-level permission requirements
- `isAdmin: true` bypasses ALL permission checks

## Runtime vs DB
| Field | Where |
|-------|-------|
| `employmentStatus` | DB (`ACTIVE`, `SUSPENDED`, `VACATION`) |
| `dutyStatus` | Runtime only (`ON_DUTY`, `OFF_DUTY`, `BUSY`, `AVAILABLE`) |
| `callsign` | Runtime only |
| `unitId` | Runtime only |
| `cadCallId` | Runtime only |
| CAD unit assignments | Runtime only (UnitManager) |
| `DispatchCall` record | DB (persisted immediately, updated in place) |

## Key Decisions
- `Civil.id` is `INT AUTOINCREMENT` — not the FiveM identifier
- `Officer.identifier` is the FiveM identifier string (`license:xxx`), used for login
- `Vehicle.ownerId` nullable — unregistered vehicles allowed
- `Weapon.ownerId` nullable — unregistered weapons allowed
- `Bolo` — single table, `targetType` + `targetIdentifier`. Integrity enforced in service layer
- `ArrestReport.penalCodeIds` — `Int[]` array, no junction table. Integrity enforced in service layer
- `OrderableItem` ↔ `Department` — M2M via `OrderableItemDepartment` join table
- `DispatchCall` goes to DB immediately on creation

## BaseService Pattern
Every service extends `BaseService<T, CreateDto, UpdateDto>` which provides:
- Cache via `@nestjs/cache-manager` (`Cache` injected)
- `getCached(key, fetcher, ttl)` — cache-aside pattern
- `invalidateId(id)` — deletes `entityKey:id:N` from cache
- `invalidatePages()` — deletes all tracked page keys from cache
- `trackPageKey(key)` — registers a page cache key for later invalidation
- `getById(id)` — cached, throws `NotFoundException` if missing
- `delete(id)` — deletes from DB + invalidates cache
- Abstract: `getPage(page, query?)`, `create(dto)`, `update(id/key, dto)`

Controller naming convention (from DepartmentController):
- `getPage` not `findAll`
- `getById` not `findOne`
- `delete` not `remove`

## Pagination
`PaginatedResult<T>` shared DTO:
```ts
{ data: T[], total: number, page: number, pageSize: number }
```
`PAGE_SIZE = 20` defined on BaseService.

## Commands
```bash
pnpm dev                    # start backend in watch mode
pnpm prisma migrate dev     # create and apply migration
pnpm prisma migrate reset   # wipe DB and reapply all migrations
pnpm prisma db seed         # seed dev data
pnpm prisma studio          # open Prisma Studio
```

## ENV
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/orchid_mdt
JWT_SECRET=128_char_random_string
FIVEM_SECRET=random_secret_for_fivem_ws
SEED_IDENTIFIER=license:test123
```

## Permissions Reference
| Permission | What it gates |
|------------|---------------|
| `manage_officers` | onboard, update employmentStatus, setAdmin, updatePermissions |
| `manage_departments` | create, update, delete departments |
| `manage_bolos` | create, deactivate BOLOs |
| `manage_records` | create/update/delete penal codes, arrest reports |
| `manage_incidents` | create, update incidents |
| `manage_dispatch` | create calls, assign units, update status |
| `manage_orderable_items` | create, update, delete orderable items |

## What's Built
- [x] PrismaModule, AuthModule, FivemModule, UnitManagerModule
- [x] JwtGuard (global), PermissionsGuard (global), @Public(), @Permissions()
- [x] BaseService<T, CreateDto, UpdateDto> with cache + pagination
- [x] PaginatedResult<T> DTO
- [x] CivilModule — getPage (search: name, surname) + CRUD
- [x] OfficerModule — getPage + CRUD + onboard (atomic) + clockOn + updateCallsign + updatePermissions + setAdmin
- [x] DepartmentModule — getPage + CRUD
- [x] FiveM server script — handshake flow

## What's Built (continued)
- [x] Task 004 — Vehicle & Weapon
- [x] Task 005 — PenalCode
- [x] Task 006 — ArrestReport
- [x] Task 007 — Bolo
- [x] Task 008 — Incident + Evidence
- [x] Task 009 — Dispatch/CAD
- [x] Task 010 — OrderableItem
- [x] Task 011 — MDT WebSocket Gateway (Vue client connections)

## Entity Types & Access Model

### SERVER entity (FiveM main server)
- Authenticates via HTTP header: `Authorization: Bearer FIVEM_SECRET`
- Guarded by `ServerGuard` — NOT JWT
- Routes prefixed `/server/*`
- God mode — can create/update any resource
- Responsible for: civil profiles, vehicles, weapons, call accept/deny (via WS :3001)

### ADMIN officer
- `isAdmin: true` on Officer record
- Bypasses all `PermissionsGuard` checks
- Manages: officers, departments, penal codes, orderable items, incidents

### Regular OFFICER
- `isAdmin: false`, scoped permissions in `permissions[]`
- Can: read records, file arrest reports, manage BOLOs (if permitted), view dispatch

## Call Accept/Deny Flow
1. MDT `POST /dispatch` → call created → `dispatch:created` broadcast to department room
2. FiveM server receives broadcast via :3001 WS, relays to cops in-game
3. Cop accepts in-game → FiveM emits `call:response` on :3001 WS: `{ callId, identifier, accepted }`
4. `FivemGateway` handles `call:response`:
   - Finds officer by `identifier` → gets their `unitId` from `UnitManager`
   - Calls `DispatchService.assignUnit(callId, unitId)`
5. `DispatchService.assignUnit` → updates DB + UnitManager + broadcasts `dispatch:assigned`

## What's Next
- [x] Task 004 — Vehicle & Weapon
- [x] Task 005 — PenalCode
- [x] Task 006 — ArrestReport
- [x] Task 007 — Bolo
- [x] Task 008 — Incident + Evidence
- [x] Task 009 — Dispatch/CAD
- [x] Task 010 — OrderableItem
- [x] Task 011 — MDT WebSocket Gateway (Vue clients + call accept/deny)
- [x] Task 012 — ServerGuard + /server/* endpoints (FiveM HTTP access)

## Development Workflow & Tools
> **Stop Building for Simple Checks:** Do not run `pnpm build` or `pnpm dev` just to check for errors. Use the linter.

- **Check for Errors (Fast)**: Run `pnpm lint`. This uses ESLint and TypeScript-ESLint to find type mismatches and logic bugs without compiling the whole project.
- **Auto-Fix Formatting**: Run `pnpm format`. This uses Prettier to align the code with project standards.
- **Type Checking**: If the linter isn't enough, use `npx tsc --noEmit` for a pure type-check.

## Updated Commands
- `pnpm lint`           # Find errors (logic/types)
- `pnpm lint --fix`     # Auto-fix linting errors
- `pnpm format`         # Run Prettier formatting
- `pnpm dev`            # Watch mode (runs build + server)
- `pnpm prisma generate`# Run after schema changes

## Coding Standards (Additions)
- **Formatting**: Always run `pnpm format` before finishing a task.
- **DTOs**: Use `!` definite assignment (e.g., `plate!: string`) to satisfy strict mode without constructors.
- **Prisma**: When updating the schema, always run `pnpm prisma generate` and `pnpm prisma migrate dev`.