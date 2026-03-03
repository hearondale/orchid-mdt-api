# Task 008 — Incident & Evidence Modules

## Status: TODO

## IncidentService (extends BaseService<Incident, CreateIncidentDto, UpdateIncidentDto>)

### Methods
- `getPage(page, query?)` — search: title, description, suspect name, officer badge
- `create(dto)` — create incident
- `update(id, dto)` — update title/description/status, invalidate cache
- `setStatus(id, status)` — dedicated status update
- `addOfficer(id, badge)` — add officer to incident_officer by badge
- `addSuspect(id, identifier)` — add suspect by FiveM identifier (looks up Officer.identifier → Civil)
- `getById(id)` — include: department, officers, suspects, arrests, bolos, evidence

### Routes
- `POST /incidents` — `@Permissions('manage_incidents')`
- `GET /incidents?page=&q=`
- `GET /incidents/:id`
- `PATCH /incidents/:id` — `@Permissions('manage_incidents')`
- `PATCH /incidents/:id/status` — body: `{ status: IncidentStatus }`
- `POST /incidents/:id/officers` — body: `{ badge: string }`
- `DELETE /incidents/:id/officers/:officerId`
- `POST /incidents/:id/suspects` — body: `{ identifier: string }` (FiveM identifier)
- `DELETE /incidents/:id/suspects/:civilId`
- `POST /incidents/:id/arrests` — body: `{ arrestId: number }`
- `POST /incidents/:id/bolos` — body: `{ boloId: number }`

### CreateIncidentDto
```
departmentId: number
title: string
description: string
```

---

## EvidenceService (extends BaseService<Evidence, CreateEvidenceDto, UpdateEvidenceDto>)
Always scoped to an incident — no standalone getPage.

### Methods
- `getByIncident(incidentId)` — all evidence for incident, cached
- `create(dto)` — `collectedById` from req.user.id
- `update(id, dto)` — update, invalidate cache
- `delete(id)` — inherited

### Routes (nested under /incidents/:incidentId/evidence)
- `POST /incidents/:incidentId/evidence`
- `GET /incidents/:incidentId/evidence`
- `PATCH /incidents/:incidentId/evidence/:id`
- `DELETE /incidents/:incidentId/evidence/:id`

### CreateEvidenceDto
```
label: string
type: EvidenceType    — PHYSICAL | DIGITAL | TESTIMONIAL | WEAPON | DOCUMENT
description: string
```

## Notes
- `addSuspect` takes FiveM `identifier` → find Officer by identifier → get civilId
- Import `ArrestModule`, `BoloModule` for linking validation
- `collectedById` always from `req.user.id`
- Export `IncidentService`
