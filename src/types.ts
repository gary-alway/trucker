export type APIResponse = {
  statusCode: number
  body: string
  headers?: {
    [header: string]: boolean | number | string
  }
}

export type AuditEntry = {
  timestamp: string
  weight: number
}

export type Parcel = {
  id: string
  weight: number
}

export type Truck = {
  id: string
  parcels: Parcel[]
  audit: AuditEntry[]
  totalWeight?: number
  status?: string
}
