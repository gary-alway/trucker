import { datatype } from 'faker'
import { AuditEntry, Parcel, Truck } from '../src/types'

export const testAudit = (overrides: Partial<AuditEntry> = {}): AuditEntry => ({
  timestamp: new Date().toISOString(),
  weight: datatype.number(),
  ...overrides
})

export const testParcel = (overrides: Partial<Parcel> = {}): Parcel => ({
  id: datatype.uuid(),
  weight: datatype.number(),
  ...overrides
})

export const testTruck = (overrides: Partial<Truck> = {}): Truck => ({
  id: datatype.uuid(),
  parcels: [testParcel()],
  audit: [testAudit()],
  ...overrides
})
