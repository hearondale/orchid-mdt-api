import { Injectable } from '@nestjs/common';
import {
  OfficerRuntime,
  UnitRuntime,
  UnitSnapshot,
  DutyStatus,
} from '../../common/types/runtime.types';

@Injectable()
export class UnitManagerService {
  // unitId → UnitRuntime
  private readonly units = new Map<string, UnitRuntime>();

  // officer.identifier → unitId
  private readonly officerToUnit = new Map<string, string>();

  // officer.identifier → OfficerRuntime
  private readonly onlineOfficers = new Map<string, OfficerRuntime>();

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
    return Array.from(this.onlineOfficers.values());
  }

  setDutyStatus(identifier: string, status: DutyStatus): OfficerRuntime | null {
    const officer = this.onlineOfficers.get(identifier);
    if (!officer) return null;
    officer.dutyStatus = status;
    return officer;
  }

  // -------------------------------------------------------------------------
  // Unit management
  // -------------------------------------------------------------------------

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
      officers: [],
      cadCallId: null,
    };
    this.units.set(unitId, unit);
    return unit;
  }

  joinUnit(identifier: string, unitId: string): void {
    const officer = this.onlineOfficers.get(identifier);
    if (!officer) return;

    // Leave any existing unit first
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

      // Auto-disband empty units
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

    return unit.officers.map((o) => ({
      officerId: o.id,
      badge: o.badge,
      callsign: o.callsign ?? '',
    }));
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
