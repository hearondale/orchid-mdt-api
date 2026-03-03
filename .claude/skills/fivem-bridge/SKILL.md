---
name: fivem-bridge
description: Specializes in NestJS WebSockets and FiveM remote API integration. Trigger when building gateways, syncing player data, or handling server status.
---

# FiveM Bridge & WebSocket Skill

## Architectural Patterns

### 1. The Gateway Sync Pattern
When creating a WebSocket gateway for FiveM, follow this pattern to avoid CPU spikes:
- **Broadcasting**: Use `server.emit()` to push data to all connected clients.
- **Namespacing**: Use `@WebSocketGateway({ namespace: 'fivem' })`.

### 2. The Cache-First Pattern
All calls to remote FiveM JSON APIs (players.json) MUST go through a service that implements caching:
- **TTL**: Default 15-30 seconds.
- **Logic**: Check cache -> If null, fetch via HttpService -> Set cache -> Return.

### 3. Error Resilience
FiveM servers are often restarted. All HTTP calls to the remote server must be wrapped in a `try/catch` that returns a "Server Offline" state rather than throwing a 500 error.

## Example File Structure
- `src/modules/fivem/fivem.gateway.ts`
- `src/modules/fivem/fivem.module.ts`
