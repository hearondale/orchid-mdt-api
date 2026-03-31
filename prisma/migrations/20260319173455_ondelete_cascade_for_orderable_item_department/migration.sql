-- DropForeignKey
ALTER TABLE "orderable_item_department" DROP CONSTRAINT "orderable_item_department_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "orderable_item_department" DROP CONSTRAINT "orderable_item_department_itemId_fkey";

-- AddForeignKey
ALTER TABLE "orderable_item_department" ADD CONSTRAINT "orderable_item_department_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "orderable_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderable_item_department" ADD CONSTRAINT "orderable_item_department_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
