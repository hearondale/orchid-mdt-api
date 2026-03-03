# Task 005 — PenalCode Module

## Status: TODO

## PenalCodeService (extends BaseService<PenalCode, CreatePenalCodeDto, UpdatePenalCodeDto>)

### Methods
- `getPage(page, query?)` — search: code, title, category
- `getByCode(code)` — find by unique code string
- `findManyByIds(ids: number[])` — used by ArrestReportService to validate penalCodeIds
- `create(dto)` — throws `ConflictException` if code exists
- `update(id, dto)` — update, invalidate cache

### Routes
- `POST /penal-codes` — `@Permissions('manage_records')`
- `GET /penal-codes?page=&q=`
- `GET /penal-codes/:id`
- `GET /penal-codes/code/:code` — lookup by code string (declare before :id)
- `PATCH /penal-codes/:id` — `@Permissions('manage_records')`
- `DELETE /penal-codes/:id` — `@Permissions('manage_records')`

### CreatePenalCodeDto
```
code: string        — unique, e.g. "PC-187"
title: string       — e.g. "Murder"
category: string    — e.g. "Crimes Against Persons"
description: string
fineAmount: number
```

## Notes
- Export `PenalCodeService` — imported by ArrestReportModule
- `findManyByIds` does NOT go through cache — always fresh DB read
