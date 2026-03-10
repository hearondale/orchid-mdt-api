import { PrismaClient, DepartmentType, EmploymentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const IDENTIFIER = process.env.SEED_IDENTIFIER ?? 'license:test123';

async function main() {
  console.log('🌱 Seeding dev database...');

  const department = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Federal Investigation Bureau',
      type: DepartmentType.FIB,
      access: ['mdt', 'dispatch', 'records'],
    },
  });
  console.log(`✓ Department: ${department.name} (id=${department.id})`);

  const civil = await prisma.civil.upsert({
    where: { id: 1 },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      dob: '1990-05-21',
      licenses: ['driver', 'weapons'],
    },
  });
  console.log(`✓ Civil: ${civil.firstName} ${civil.lastName} (id=${civil.id})`);

  const officer = await prisma.officer.upsert({
    where: { identifier: IDENTIFIER },
    update: {},
    create: {
      civilId: civil.id,
      departmentId: department.id,
      identifier: IDENTIFIER,
      badge: '4194',
      callsign: 'Eagle-3',
      rank: 'Special Agent',
      isAdmin: true,
      employmentStatus: EmploymentStatus.ACTIVE,
      permissions: [
        'manage_bolos',
        'view_records',
        'manage_officers',
        'manage_departments',
      ],
    },
  });
  console.log(
    `✓ Officer: badge=${officer.badge} identifier=${officer.identifier} (id=${officer.id})`,
  );

  console.log('\n✅ Seed complete.');
  console.log(`   Use identifier "${IDENTIFIER}" to authenticate.\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
