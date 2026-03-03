# Task 006 — ArrestReport Module

## Status: TODO

## ArrestService (extends BaseService<ArrestReport, CreateArrestDto, UpdateArrestDto>)
Note: class diagram names this `ArrestService` not `ArrestReportService`.

### Methods
- `getPage(page, query?)` — search: suspect name, officer badge
- `create(dto)` — validate all penalCodeIds exist via PenalCodeService.findManyByIds(), throw BadRequestException if any missing
- `update(id, dto)` — update, invalidate cache
- `getById(id)` — inherited, include: suspect civil, processingOfficer, resolved PenalCode objects

### Routes
- `POST /arrests` — `@Permissions('manage_records')`
- `GET /arrests?page=&q=`
- `GET /arrests/:id`
- `PATCH /arrests/:id` — `@Permissions('manage_records')`
- `DELETE /arrests/:id` — `@Permissions('manage_records')`

### CreateArrestDto
```
suspectId: number              — Civil.id
processingOfficerId?: number   — defaults to req.user.id
penalCodeIds: number[]
bailAmount?: number
sentenceMinutes?: number
notes?: string
```

## Notes
- `processingOfficerId` defaults to `req.user.id` if not provided — inject `@Request()` in controller
- On `getById`, resolve penal codes from `penalCodeIds` array and embed full `PenalCode[]` in response
- Import `PenalCodeModule`
- Export `ArrestService` — needed by IncidentModule
