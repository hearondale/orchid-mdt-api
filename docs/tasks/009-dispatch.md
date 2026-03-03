# Task 009 — Dispatch / CAD Module

## Status: TODO

## DispatchService (extends BaseService<DispatchCall, CreateDispatchCallDto, UpdateDispatchCallDto>)

### Methods
- `getPage(page, query?)` — search: code, message, location
- `create(dto)` — persist to DB immediately, broadcast `dispatch:created` WS event
- `update(id, dto)` — update, invalidate cache, broadcast `dispatch:updated`
- `assignUnit(id, unitId)` — assign unit to call:
  1. Write `DispatchOfficer` records for each officer in unit
  2. Call `UnitManager.assignUnitToCall(unitId, callId)`
  3. Broadcast `dispatch:assigned`
- `unassignUnit(id, unitId)` — reverse of above
- `close(id)` — set status CLOSED, unassign all units, broadcast `dispatch:updated`
- `getById(id)` — inherited, merge DB record with `UnitManager.getUnitSnapshots()` for live unit data

### Routes
- `POST /dispatch` — `@Permissions('manage_dispatch')`
- `GET /dispatch?page=&q=`
- `GET /dispatch/:id`
- `PATCH /dispatch/:id` — `@Permissions('manage_dispatch')`
- `PATCH /dispatch/:id/assign` — body: `{ unitId: string }` — `@Permissions('manage_dispatch')`
- `PATCH /dispatch/:id/unassign` — body: `{ unitId: string }` — `@Permissions('manage_dispatch')`
- `PATCH /dispatch/:id/close` — `@Permissions('manage_dispatch')`

### CreateDispatchCallDto
```
code: string       — e.g. "10-31"
message: string
priority: string   — "HIGH" | "MEDIUM" | "LOW"
location: string
```

## WebSocket Events (MDT Gateway — Task 010)
| Event | Payload | Trigger |
|-------|---------|---------|
| `dispatch:created` | `CadCallRuntime` | call created |
| `dispatch:updated` | `CadCallRuntime` | status changed |
| `dispatch:assigned` | `{ callId, units: UnitSnapshot[] }` | unit assigned/unassigned |

## Notes
- WS broadcasts injected via MDT Gateway service — build Task 010 first or alongside
- `getById` response shape is `CadCallRuntime` (DispatchCall + units: UnitSnapshot[])
- On server restart all runtime unit assignments are lost (intentional)
