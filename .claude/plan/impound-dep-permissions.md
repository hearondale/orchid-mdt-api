Plan: Impound Module + Department-Level Permissions

Context

Add an Impound module for tracking impounded vehicles. Vehicles are stored with their properties directly (plate, make, model, color, ownerName) since the vehicle  
 may not exist in the system. The record also stores impound price, a release date (before which the owner cannot retrieve the car), an optional reason, and which  
 officer issued the impound.

Simultaneously, wire up the existing Department.access String[] field (already in schema, currently unused) to the PermissionsGuard. This enables department-level  
 module access: any officer in a department whose access[] includes 'manage_impounds' can write impounds — without needing individual per-officer permissions.

---

Part 1 — Wire Up Department.access (Permissions System Change)

1a. src/modules/auth/strategies/jwt.strategy.ts

Add include: { department: true } to the prisma.officer.findUnique() call so req.user carries the linked Department object.

Before:
const officer = await this.prisma.officer.findUnique({ where: { id: payload.sub } });
After:
const officer = await this.prisma.officer.findUnique({
where: { id: payload.sub },
include: { department: true },
});

1b. src/common/guards/permissions.guard.ts

Extend the permission check to also accept matching entries in officer.department.access.

import { Officer, Department } from '@prisma/client';
type OfficerWithDept = Officer & { department: Department };

const officer = request.user as OfficerWithDept;
const ok =
officer.isAdmin ||
required.every(
p => officer.permissions.includes(p) || officer.department?.access.includes(p),
);

No schema changes needed for Part 1 — Department.access already exists.

---

Part 2 — Impound Module

2a. prisma/schema.prisma

Add Impound model and back-relation on Officer.

model Impound {
id Int @id @default(autoincrement())
plate String
make String
model String
color String
ownerName String?
reason String?
price Float
releaseDate DateTime
createdAt DateTime @default(now())
issuedById Int
issuedBy Officer @relation("IssuedImpounds", fields: [issuedById], references: [id])

@@map("impounds")
}

On Officer model, add the back-relation:
impounds Impound[] @relation("IssuedImpounds")

2b. DTOs

src/modules/impound/dto/create-impound.dto.ts
export class CreateImpoundDto {
plate!: string;
make!: string;
model!: string;
color!: string;
ownerName?: string;
reason?: string;
price!: number;
releaseDate!: string; // ISO string; service converts to Date
issuedById?: number; // set by controller from req.user.id
}

src/modules/impound/dto/update-impound.dto.ts
export class UpdateImpoundDto {
ownerName?: string;
reason?: string;
price?: number;
releaseDate?: string;
}

2c. src/modules/impound/impound.service.ts

Extends BaseService<Impound, CreateImpoundDto, UpdateImpoundDto> with entity key 'impound'.

const IMPOUND_INCLUDE = {
issuedBy: { select: { id: true, badge: true } },
} as const;

- getPage(page, query?) — searches plate, ownerName; cached 15s with query, 30s without
- create(dto) — converts releaseDate string → Date, invalidates pages
- update(id, dto) — partial update, converts releaseDate if provided, invalidates id + pages
- getById(id) — override to use IMPOUND_INCLUDE (cached 5 min)
- delete(id) — inherited

2d. src/modules/impound/impound.controller.ts

POST /impounds — create (requires 'manage_impounds'; sets issuedById from req.user.id)
GET /impounds?page&q — getPage
GET /impounds/:id — getById
PATCH /impounds/:id — update (requires 'manage_impounds')
DELETE /impounds/:id — delete (requires 'manage_impounds')

2e. src/modules/impound/impound.module.ts

@Module({
controllers: [ImpoundController],
providers: [ImpoundService],
exports: [ImpoundService],
})

No extra module imports needed (PrismaModule and CacheModule are global).

2f. Specs

- impound.service.spec.ts — standard pattern (mock PrismaService + CACHE_MANAGER)
- impound.controller.spec.ts — standard pattern (mock ImpoundService, override JwtGuard + PermissionsGuard)

2g. src/app.module.ts

Import ImpoundModule.

---

Files to Create (new)

- src/modules/impound/dto/create-impound.dto.ts
- src/modules/impound/dto/update-impound.dto.ts
- src/modules/impound/impound.service.ts
- src/modules/impound/impound.controller.ts
- src/modules/impound/impound.service.spec.ts
- src/modules/impound/impound.controller.spec.ts
- src/modules/impound/impound.module.ts

Files to Modify

- prisma/schema.prisma — add Impound model + Officer back-relation
- src/modules/auth/strategies/jwt.strategy.ts — include department in officer lookup
- src/common/guards/permissions.guard.ts — add department.access check
- src/app.module.ts — import ImpoundModule

---

Verification

1.  pnpm prisma migrate dev --name add_impound — creates DB table
2.  pnpm prisma generate — regenerates client types
3.  pnpm lint — no type errors
4.  pnpm format — clean
5.  Manual checks:

- Add 'manage_impounds' to a department's access[] via PATCH /departments/:id
- POST /impounds as an officer in that department → 201
- POST /impounds as an officer NOT in that department → 403
- GET /impounds?q=ABC twice → second hit cached (15s TTL)
- POST /impounds then GET /impounds → fresh DB hit (cache invalidated)
  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
