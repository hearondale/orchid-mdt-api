# Task 012 — Server Guard & Server-Only Endpoints

## Status: TODO

## Goal
FiveM main server needs HTTP access to create/update civilians, vehicles, weapons, and trigger dispatch events.
These endpoints are inaccessible to JWT-authenticated officers — only the FiveM server can call them.

## ServerGuard
```ts
// src/common/guards/server.guard.ts
// Checks: Authorization: Bearer FIVEM_SECRET
// If matches → allow. Otherwise → 403.
```
Applied with `@UseGuards(ServerGuard)` — NOT a global guard.
Also apply `@SkipJwtGuard()` (or `@Public()`) so JwtGuard doesn't reject it first.

## Server-Only Endpoints

### Civil (FiveM server creates/updates player civil profiles)
- `POST /server/civil` — create civil
- `PATCH /server/civil/:id` — update civil

### Vehicle (FiveM server syncs vehicle ownership/stolen state)
- `POST /server/vehicle` — create vehicle
- `PATCH /server/vehicle/:plate/stolen` — mark stolen

### Weapon (FiveM server syncs weapon ownership)
- `POST /server/weapon` — create weapon
- `PATCH /server/weapon/:serial/stolen` — mark stolen

All under `/server` prefix, all guarded by `ServerGuard`.

## ServerModule
- `ServerController` — all the above routes
- Imports: `CivilModule`, `VehicleModule`, `WeaponModule`
- No service of its own — delegates to existing services

## Notes
- Regular officer-facing endpoints (PATCH /vehicles/:plate etc.) remain for admin use
- `ServerGuard` reads `FIVEM_SECRET` from `ConfigService`
- Add `ServerModule` to `AppModule`
