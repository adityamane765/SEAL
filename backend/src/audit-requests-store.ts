import { readJson, writeJson } from './persistence/json-store.js';
import type { AuditRequestRecord } from './audit/audit-types.js';

const FILE = 'audit-requests.json';

export function readAuditRequests(): AuditRequestRecord[] {
  return readJson<AuditRequestRecord[]>(FILE, []);
}

export function writeAuditRequests(rows: AuditRequestRecord[]): void {
  writeJson(FILE, rows);
}
