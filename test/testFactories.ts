import { datatype } from 'faker'
import { Parcel, Truck } from '../src/types'

export const testParcel = (overrides: Partial<Parcel> = {}): Parcel => ({
  id: datatype.uuid(),
  weight: datatype.number(),
  ...overrides
})

export const testTruck = (overrides: Partial<Truck> = {}): Truck => ({
  id: datatype.uuid(),
  parcels: [testParcel()],
  ...overrides
})
