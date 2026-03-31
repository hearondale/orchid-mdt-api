import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { MdtGatewayService } from '../mdt/mdt-gateway.service';
import {
  OfficerRuntime,
  UnitRuntime,
  UnitSnapshot,
  DutyStatus,
} from '../../common/types/runtime.types';

@Injectable()
export class UnitManagerService {
  private readonly units = new Map<string, UnitRuntime>();

  private readonly officerToUnit = new Map<string, string>();

  private readonly onlineOfficers = new Map<string, OfficerRuntime>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly mdtGateway: MdtGatewayService,
  ) {}

  setOnline(officer: OfficerRuntime): void {
    this.onlineOfficers.set(officer.identifier, officer);
  }

  setOffline(identifier: string): void {
    this.leaveCurrentUnit(identifier);
    this.onlineOfficers.delete(identifier);
  }

  getOnlineOfficer(identifier: string): OfficerRuntime | null {
    return this.onlineOfficers.get(identifier) ?? null;
  }

  getAllOnline(): OfficerRuntime[] {
    console.log(this.onlineOfficers.values());
    return Array.from(this.onlineOfficers.values());
  }

  setDutyStatus(identifier: string, status: DutyStatus): OfficerRuntime | null {
    const officer = this.onlineOfficers.get(identifier);
    if (!officer) return null;
    officer.dutyStatus = status;
    return officer;
  }

  createUnit(
    unitId: string,
    name: string,
    department: string,
    callsign: string,
  ): UnitRuntime {
    const unit: UnitRuntime = {
      id: unitId,
      name,
      department,
      callsign,
      status: '10-8',
      officers: [],
      cadCallId: null,
    };
    this.units.set(unitId, unit);

    return unit;
  }

  joinUnit(identifier: string, unitId: string): void {
    const officer = this.onlineOfficers.get(identifier);
    if (!officer) return;

    this.leaveCurrentUnit(identifier);

    const unit = this.units.get(unitId);
    if (!unit) return;

    officer.unitId = unitId;
    unit.officers.push(officer);
    this.officerToUnit.set(identifier, unitId);
  }

  leaveCurrentUnit(identifier: string): void {
    const unitId = this.officerToUnit.get(identifier);
    if (!unitId) return;

    const unit = this.units.get(unitId);
    if (unit) {
      unit.officers = unit.officers.filter((o) => o.identifier !== identifier);

      if (unit.officers.length === 0) {
        this.units.delete(unitId);
      }
    }

    const officer = this.onlineOfficers.get(identifier);
    if (officer) {
      officer.unitId = null;
    }

    this.officerToUnit.delete(identifier);
  }

  getOfficerUnit(identifier: string): UnitRuntime | null {
    const unitId = this.officerToUnit.get(identifier);
    if (!unitId) return null;
    return this.units.get(unitId) ?? null;
  }

  getUnit(unitId: string): UnitRuntime | null {
    return this.units.get(unitId) ?? null;
  }

  getAllUnits(): UnitRuntime[] {
    return Array.from(this.units.values());
  }

  disbandUnit(unitId: string): void {
    const unit = this.units.get(unitId);
    if (!unit) return;

    for (const officer of unit.officers) {
      officer.unitId = null;
      this.officerToUnit.delete(officer.identifier);
    }

    this.units.delete(unitId);
  }

  assignUnitToCall(unitId: string, cadCallId: number): void {
    const unit = this.units.get(unitId);
    if (!unit) return;

    unit.cadCallId = cadCallId;
    for (const officer of unit.officers) {
      officer.cadCallId = cadCallId;
    }
  }

  unassignUnitFromCall(unitId: string): void {
    const unit = this.units.get(unitId);
    if (!unit) return;

    unit.cadCallId = null;
    for (const officer of unit.officers) {
      officer.cadCallId = null;
    }
  }

  getUnitSnapshots(unitId: string): UnitSnapshot[] {
    const unit = this.units.get(unitId);
    if (!unit) return [];
    return [
      {
        callsign: unit.callsign,
        name: unit.name,
        officerIds: unit.officers.map((o) => o.id),
      },
    ];
  }

  getUnitsForCall(callId: number): UnitSnapshot[] {
    const snapshots: UnitSnapshot[] = [];
    for (const unit of this.units.values()) {
      if (unit.cadCallId === callId) {
        snapshots.push({
          callsign: unit.callsign,
          name: unit.name,
          officerIds: unit.officers.map((o) => o.id),
        });
      }
    }
    return snapshots;
  }

  async assignOfficerUnit(
    callId: number,
    officerIdentifier: string,
  ): Promise<void> {
    const call = await this.prisma.dispatchCall.findUnique({
      where: { id: callId },
    });
    if (!call)
      throw new NotFoundException(`Dispatch call #${callId} not found`);

    const unit = this.getOfficerUnit(officerIdentifier);
    console.log(
      'Assigning officer',
      officerIdentifier,
      'unit',
      unit?.id,
      'to call',
      callId,
    );
    if (!unit) return;

    const dispatchUnit = await this.prisma.dispatchUnit.upsert({
      where: {
        dispatchId_callsign: { dispatchId: callId, callsign: unit.callsign },
      },
      create: { dispatchId: callId, callsign: unit.callsign, name: unit.name },
      update: {},
    });

    await this.prisma.$transaction(
      unit.officers.map((o) =>
        this.prisma.dispatchUnitOfficer.upsert({
          where: {
            unitId_officerId: { unitId: dispatchUnit.id, officerId: o.id },
          },
          create: { unitId: dispatchUnit.id, officerId: o.id },
          update: {},
        }),
      ),
    );

    this.assignUnitToCall(unit.id, callId);
    await this.cache.del(`dispatchCall:id:${callId}`);

    const units = this.getUnitsForCall(callId);
    this.mdtGateway.broadcastToAll('dispatch:assigned', { callId, units });
  }

  async unassignOfficerUnit(
    callId: number,
    officerIdentifier: string,
  ): Promise<void> {
    const unit = this.getOfficerUnit(officerIdentifier);
    if (unit) {
      await this.prisma.dispatchUnit.deleteMany({
        where: { dispatchId: callId, callsign: unit.callsign },
      });
      this.unassignUnitFromCall(unit.id);
    }
    await this.cache.del(`dispatchCall:id:${callId}`);
    this.mdtGateway.broadcastToAll('dispatch:assigned', {
      callId,
      units: this.getUnitsForCall(callId),
    });
  }

  /** Called when a player disconnects from FiveM */
  officerDisconnected(identifier: string): void {
    this.setOffline(identifier);
  }

  /** Full wipe — called on server restart (intentional) */
  clear(): void {
    this.units.clear();
    this.officerToUnit.clear();
    this.onlineOfficers.clear();
  }
}
