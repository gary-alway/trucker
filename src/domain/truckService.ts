import { getDynamoClient } from '../clients/getClients'
import { v4 as uuid } from 'uuid'
import { API, DDB_TABLE } from '../constants'
import { pathOr } from 'ramda'
import { Parcel, Truck } from '../types'

const transformTruckRecord = (
  { id, parcels = [] }: Truck,
  showStatus = true
): Truck => ({
  id,
  parcels,
  totalWeight: parcels.reduce(
    (acc: number, curr: Parcel) => acc + curr.weight,
    0
  ),
  status: showStatus ? `${API}/trucks/${id}` : undefined
})

export const createTruck = async (
  client = getDynamoClient()
): Promise<string> => {
  const id = uuid()
  await client.putItem({ id }, DDB_TABLE)
  return id
}

export const loadTruck = async (
  id: string,
  parcels: Parcel[],
  client = getDynamoClient()
): Promise<void> => {
  await client.putItem({ id, parcels }, DDB_TABLE)
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

export const unloadTruck = async (
  id: string,
  parcels: string[],
  client = getDynamoClient()
): Promise<Parcel[]> => {
  const truck = await trucksStatus(id, client)

  const offload = truck.parcels.filter(p => parcels.includes(p.id))
  const remaining = truck.parcels.filter(p => !parcels.includes(p.id))

  await loadTruck(id, remaining, client)

  return offload
}

export const getTrucks = async (client = getDynamoClient()): Promise<Truck[]> =>
  client
    .scan(DDB_TABLE)
    .then(res =>
      pathOr<Truck[]>([], ['Items'], res).map(t => transformTruckRecord(t))
    )
