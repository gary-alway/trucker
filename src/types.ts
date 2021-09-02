export type APIResponse = {
  statusCode: number
  body: string
  headers?: {
    [header: string]: boolean | number | string
  }
}

export type Parcel = {
  id: string
  weight: number
}

export type Truck = {
  id: string
  parcels: Parcel[]
  totalWeight?: number
  status?: string
}
