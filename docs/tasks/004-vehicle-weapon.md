# Task 004 — Vehicle & Weapon Modules

## Status: TODO

## Pattern
Both extend `BaseService`. Both use natural unique keys for update (plate / serialNumber).

---

## VehicleService (extends BaseService<Vehicle, CreateVehicleDto, UpdateVehicleDto>)

### Methods
- `getPage(page, query?)` — paginated, search: plate, make, model, owner name
- `create(dto)` — throws `ConflictException` if plate or vin exists
- `update(plate, dto)` — find by plate, update, invalidate cache
- `markStolen(plate, value: boolean)` — dedicated stolen flag toggle
- `getById(id)` — inherited, include owner civil

### Routes (DepartmentController naming convention)
- `POST /vehicles` — `@Permissions('manage_records')`
- `GET /vehicles?page=&q=`
- `GET /vehicles/:id`
- `PATCH /vehicles/:plate`
- `PATCH /vehicles/:plate/stolen` — body: `{ stolen: boolean }`
- `DELETE /vehicles/:id`

### CreateVehicleDto
```
plate: string
vin: string
make: string
model: string
color: string
stolen?: boolean
ownerId?: number  — nullable
```

---

## WeaponService (extends BaseService<Weapon, CreateWeaponDto, UpdateWeaponDto>)

### Methods
- `getPage(page, query?)` — paginated, search: serial, type, owner name
- `create(dto)` — throws `ConflictException` if serialNumber exists
- `update(serial, dto)` — find by serialNumber, update, invalidate cache
- `markStolen(serial, value: boolean)` — dedicated stolen flag toggle
- `getById(id)` — inherited, include owner civil

### Routes
- `POST /weapons` — `@Permissions('manage_records')`
- `GET /weapons?page=&q=`
- `GET /weapons/:id`
- `PATCH /weapons/:serialNumber`
- `PATCH /weapons/:serialNumber/stolen` — body: `{ stolen: boolean }`
- `DELETE /weapons/:id`

### CreateWeaponDto
```
serialNumber: string
weaponType: string
registered?: boolean
stolen?: boolean
notes?: string
ownerId?: number  — nullable
```

## Notes
- Export both services — needed by BoloModule for target validation
- `@ApiTags('Vehicles')` / `@ApiTags('Weapons')` + `@ApiBearerAuth()` on controllers
- Include owner civil on `getById` and `getPage` responses
