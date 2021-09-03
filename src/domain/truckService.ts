import { getDynamoClient } from '../clients/getClients'
import { v4 as uuid } from 'uuid'
import { API, DDB_TABLE } from '../constants'
import { pathOr } from 'ramda'
import { Parcel, Truck } from '../types'

const calcTruckWeight = (parcels: Parcel[]): number =>
  parcels.reduce((acc: number, curr: Parcel) => acc + curr.weight, 0)

const transformTruckRecord = (
  { id, parcels = [] }: Truck,
  showStatus = true
): Truck => ({
  id,
  parcels,
  totalWeight: calcTruckWeight(parcels),
  status: showStatus ? `${API}/trucks/${id}` : undefined
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
  const { parcels } = await trucksStatus(id, client)
  const parcelIds = parcels.map(({ id }) => id)

  const updatedParcels = [
    ...parcels,
    ...incomingParcels.filter(({ id }) => !parcelIds.includes(id))
  ]

  await client.putItem({ id, parcels: updatedParcels }, DDB_TABLE)
}

export const unloadTruck = async (
  id: string,
  parcelsToOffload: string[],
  client = getDynamoClient()
): Promise<Parcel[]> => {
  const { parcels } = await trucksStatus(id, client)

  const offload = parcels.filter(p => parcelsToOffload.includes(p.id))
  const remaining = parcels.filter(p => !parcelsToOffload.includes(p.id))

  await client.putItem({ id, parcels: remaining }, DDB_TABLE)

  return offload
}

export const getTrucks = async (client = getDynamoClient()): Promise<Truck[]> =>
  client
    .scan(DDB_TABLE)
    .then(res =>
      pathOr<Truck[]>([], ['Items'], res).map(t => transformTruckRecord(t))
    )
