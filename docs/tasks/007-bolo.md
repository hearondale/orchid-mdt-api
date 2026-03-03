# Task 007 — Bolo Module

## Status: TODO

## BoloService (extends BaseService<Bolo, CreateBoloDto, UpdateBoloDto>)

### Methods
- `getPage(page, query?)` — search: targetIdentifier, description
- `create(dto)` — validate target exists, `issuedById` from req.user.id
- `update(id, dto)` — update, invalidate cache
- `deactivate(id)` — set `active: false`, invalidate cache
- `getById(id)` — inherited, include issuedBy officer

### Routes
- `POST /bolos` — `@Permissions('manage_bolos')`
- `GET /bolos?page=&q=`
- `GET /bolos/:id`
- `PATCH /bolos/:id` — `@Permissions('manage_bolos')`
- `PATCH /bolos/:id/deactivate` — `@Permissions('manage_bolos')`
- `DELETE /bolos/:id` — `@Permissions('manage_bolos')`

### CreateBoloDto
```
targetType: BoloType          — PERSON | VEHICLE | WEAPON
targetIdentifier: string      — Civil.id (as string) | Vehicle.plate | Weapon.serialNumber
description: string
expiresAt?: string            — ISO date string
```

## Target Validation (service layer)
| targetType | resolve via |
|------------|-------------|
| PERSON | `CivilService.getById(parseInt(targetIdentifier))` |
| VEHICLE | `VehicleService` find by plate |
| WEAPON | `WeaponService` find by serialNumber |

Throw `NotFoundException` if target not found.

## Notes
- `issuedById` always from `req.user.id` — not in DTO
- Import `CivilModule`, `VehicleModule`, `WeaponModule`
- Export `BoloService` — needed by IncidentModule
