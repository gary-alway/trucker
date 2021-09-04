import { getDynamoClient } from '../clients/getClients'
import { v4 as uuid } from 'uuid'
import { API, DDB_TABLE } from '../constants'
import { pathOr } from 'ramda'
import { AuditEntry, Parcel, Truck } from '../types'

export const calcTruckWeight = (parcels: Parcel[]): number =>
  parcels.reduce((acc: number, curr: Parcel) => acc + curr.weight, 0)

const transformTruckRecord = (
  { id, parcels = [], audit = [] }: Truck,
  showStatus = true
): Truck => ({
  id,
  parcels,
  totalWeight: calcTruckWeight(parcels),
  status: showStatus ? `${API}/trucks/${id}` : undefined,
  audit
})

export const createTruck = async (
  client = getDynamoClient()
): Promise<string> => {
  const id = uuid()
  await client.putItem({ id }, DDB_TABLE)
  return id
}

export const trucksStatus = async (
  id: string,
  client = getDynamoClient()
): Promise<Truck> =>
  client
    .getItem({
      TableName: DDB_TABLE,
      Key: {
        id
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })
    .then(res => {
      const truck = pathOr<Truck | undefined>(undefined, ['Item'], res)

      if (!truck) {
        throw new Error(`truck: [${id}] not found`)
      }

      return transformTruckRecord(truck, false)
    })

export const loadTruck = async (
  id: string,
  incomingParcels: Parcel[],
  client = getDynamoClient()
): Promise<void> => {
  const { parcels, audit } = await trucksStatus(id, client)
  const parcelIds = parcels.map(({ id }) => id)

  const updatedParcels = [
    ...parcels,
    ...incomingParcels.filter(({ id }) => !parcelIds.includes(id))
  ]

  const auditEntry: AuditEntry = {
    timestamp: new Date().toISOString(),
    weight: calcTruckWeight(updatedParcels)
  }

  const updatedAudit = [...audit, auditEntry]

  await client.putItem(
    { id, parcels: updatedParcels, audit: updatedAudit },
    DDB_TABLE
  )
}

export const unloadTruck = async (
  id: string,
  parcelsToOffload: string[],
  client = getDynamoClient()
): Promise<Parcel[]> => {
  const { parcels, audit } = await trucksStatus(id, client)

  const offload = parcels.filter(p => parcelsToOffload.includes(p.id))
  const remaining = parcels.filter(p => !parcelsToOffload.includes(p.id))

  const auditEntry: AuditEntry = {
    timestamp: new Date().toISOString(),
    weight: calcTruckWeight(remaining)
  }

  const updatedAudit = [...audit, auditEntry]

  await client.putItem(
    { id, parcels: remaining, audit: updatedAudit },
    DDB_TABLE
  )

  return offload
}

export const getTrucks = async (client = getDynamoClient()): Promise<Truck[]> =>
  client
    .scan(DDB_TABLE)
    .then(res =>
      pathOr<Truck[]>([], ['Items'], res).map(t => transformTruckRecord(t))
    )
