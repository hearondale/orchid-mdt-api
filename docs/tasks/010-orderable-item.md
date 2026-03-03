# Task 010 — OrderableItem Module

## Status: TODO

## OrderableItemService (extends BaseService<OrderableItem, CreateOrderableItemDto, UpdateOrderableItemDto>)

### Methods
- `getPage(page, type?)` — filter by `OrderItemType` (WEAPON | EQUIPMENT | VEHICLE), not a text search
- `create(dto)` — create item + link departments via OrderableItemDepartment
- `update(id, dto)` — update item + re-sync department links
- `delete(id)` — inherited

### Routes (admin only — all require `@Permissions('manage_orderable_items')`)
- `POST /orderable-items`
- `GET /orderable-items`
- `GET /orderable-items?page=&type=`
- `GET /orderable-items/:id`
- `PATCH /orderable-items/:id`
- `DELETE /orderable-items/:id`

### CreateOrderableItemDto
```
name: string
type: OrderItemType       — WEAPON | EQUIPMENT | VEHICLE
spawncode: string
amount: number
departmentIds: number[]   — departments that can order this item
```

## Notes
- On create/update, sync `OrderableItemDepartment` records — delete old links, insert new ones, all in a transaction
- Cache invalidation: invalidate item + all pages on any mutation
- This is basically CRUD and will only be shown, all the order logic will be handled by the Main Server (fivem server :30120)
