# Task 011 — MDT WebSocket Gateway

## Status: TODO

## Goal
The MDT Gateway handles Vue client connections on :3000.
Clients authenticate with their JWT on connection.
Used by DispatchService and OfficerService to broadcast events to MDT clients.

The FiveM WS (:3001) is a SEPARATE gateway (FivemGateway, already built).
This gateway is for MDT Vue clients only.

## MdtGateway
- Namespace: `/mdt` on port 3000 (shared with HTTP)
- On connection: validate JWT from `socket.handshake.auth.token`
- On valid JWT: join officer to department room `department:${departmentId}`
- On disconnect: log

## Call Accept/Deny Flow
1. Dispatch creates a call on MDT backend → `dispatch:created` broadcast to department room
2. FiveM server receives the call broadcast via its own :3001 WS connection and relays it in-game to all cops
3. Cop accepts/denies in-game → FiveM server emits `call:response` on :3001 WS to MDT backend
4. MDT backend receives acceptance → assigns the WHOLE UNIT of that officer to the call
5. MDT broadcasts `dispatch:assigned` to department room with updated unit snapshots
6. FivemGateway handles `call:response` — calls `DispatchService.assignUnit(callId, unitId)`

## Events (server → MDT Vue clients)
| Event | Room | Payload |
|-------|------|---------|
| `dispatch:created` | `department:${id}` | `CadCallRuntime` |
| `dispatch:updated` | `department:${id}` | `CadCallRuntime` |
| `dispatch:assigned` | `department:${id}` | `{ callId: number, units: UnitSnapshot[] }` |
| `officer:clockedOn` | `department:${id}` | `OfficerRuntime` |
| `officer:clockedOff` | `department:${id}` | `{ officerId: number }` |

## Events (FiveM server → backend, handled in FivemGateway)
| Event | Payload | Handler |
|-------|---------|---------|
| `call:response` | `{ callId: number, identifier: string, accepted: boolean }` | If accepted: get officer's unitId from UnitManager → `DispatchService.assignUnit(callId, unitId)` |

## MdtGatewayService
Global injectable wrapper so other services broadcast without importing the gateway directly:
```ts
broadcastToDepartment(departmentId: number, event: string, payload: any): void
```

## Notes
- `MdtGatewayModule` is `@Global()` — DispatchService and OfficerService inject `MdtGatewayService`
- JWT validation uses same `JwtService` — no new strategy
- `call:response` handling lives in `FivemGateway` (already built file), not here — add the handler there
