import { Civil, Officer, Department, DispatchCall } from '@prisma/client';

export enum DutyStatus {
  ON_DUTY = 'ON_DUTY',
  OFF_DUTY = 'OFF_DUTY',
  BUSY = 'BUSY',
  AVAILABLE = 'AVAILABLE',
}

export interface OfficerRuntime extends Officer {
  dutyStatus: DutyStatus;
  unitId: string | null; // ID of the Unit this officer is currently in
  cadCallId: number | null; // DispatchCall.id this officer is assigned to
}

export interface UnitRuntime {
  id: string;
  name: string;
  department: string;
  callsign: string;
  status: string;
  officers: OfficerRuntime[];
  cadCallId: number | null;
}

export interface UnitSnapshot {
  officerId: number;
  callsign: string;
  status: string;
}

export interface CadCallRuntime extends DispatchCall {
  units: UnitSnapshot[];
}

export interface OfficerSession extends Officer {
  civil: Civil;
  department: Department;
}

export interface ActiveOfficer {
  officer: OfficerRuntime;
  unit: UnitRuntime | null;
  activeStatus: DutyStatus;
  joinedAt: Date;
}

export interface UnitLocation {
  unit: UnitRuntime;
  x: number;
  y: number;
  z: number;
}
