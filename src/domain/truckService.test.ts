import { createDynamoMockClient } from '../../test/testAwsMockClients'
import { testAudit, testParcel, testTruck } from '../../test/testFactories'
import * as getClients from '../clients/getClients'
import { DDB_TABLE } from '../constants'
import { AuditEntry, Parcel } from '../types'
import {
  calcTruckWeight,
  createTruck,
  getTrucks,
  loadTruck,
  trucksStatus,
  unloadTruck
} from './truckService'

const scan = jest.fn()
const getItem = jest.fn()
const mockClient = createDynamoMockClient({ getItem, scan })
const parcels = [testParcel(), testParcel(), testParcel(), testParcel()]
const audit = [testAudit()]
const id = '1234'
const truck = testTruck({ id, parcels, audit })
const truckRecord = { Item: truck }
const trucks = [truck, testTruck()]
const trucksRecord = { Items: trucks }

jest.spyOn(getClients, 'getDynamoClient').mockReturnValue(mockClient)
const timestamp = new Date().toISOString()
jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => timestamp)

describe.each([[true], [false]])('default client: %s', defaultClient => {
  const client = defaultClient ? undefined : mockClient
  beforeEach(jest.clearAllMocks)

  it('creates a new truck', async () => {
    const truckId = await createTruck(client)

    expect(mockClient.putItem).toHaveBeenCalledTimes(1)
    expect(mockClient.putItem).toHaveBeenCalledWith(
      { id: expect.any(String) },
      DDB_TABLE
    )
    expect(truckId).toBeDefined()
  })

  it('gets all trucks', async () => {
    scan.mockResolvedValueOnce(trucksRecord)
    const trucks = await getTrucks(client)

    expect(scan).toHaveBeenCalledTimes(1)
    expect(scan).toHaveBeenCalledWith(DDB_TABLE)
    expect(trucks).toEqual(trucks)
  })

  it('gets a truck status', async () => {
    getItem.mockResolvedValueOnce(truckRecord)
    const status = await trucksStatus(id, client)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE,
      Key: {
        id
      }
    })
    expect(status).toMatchObject({
      ...truck,
      totalWeight: parcels.reduce(
        (acc: number, curr: Parcel) => acc + curr.weight,
        0
      )
    })
  })

  it('gets a newly created truck status', async () => {
    getItem.mockResolvedValueOnce({ Item: { id } })
    const status = await trucksStatus(id, client)

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE,
      Key: {
        id
      }
    })
    expect(status).toMatchObject({
      id,
      parcels: [],
      totalWeight: 0
    })
  })

  it('handles truck not found', async () => {
    getItem.mockResolvedValueOnce(undefined)
    await expect(trucksStatus(id, client)).rejects.toEqual(
      new Error(`truck: [${id}] not found`)
    )
  })

  it('loads a truck ignoring duplicates', async () => {
    getItem.mockResolvedValueOnce(truckRecord)
    await loadTruck(id, parcels, client)

    const auditEntry: AuditEntry = {
      timestamp,
      weight: calcTruckWeight(parcels)
    }

    const updatedAudit = [...audit, auditEntry]

    expect(mockClient.putItem).toHaveBeenCalledTimes(1)
    expect(mockClient.putItem).toHaveBeenCalledWith(
      { id, parcels, audit: updatedAudit },
      DDB_TABLE
    )
  })

  it('adds parcels to an already loaded truck', async () => {
    getItem.mockResolvedValueOnce(truckRecord)

    const newParcels = [testParcel(), testParcel()]

    await loadTruck(id, newParcels, client)

    const newTruckLoad = [...parcels, ...newParcels]

    const auditEntry: AuditEntry = {
      timestamp,
      weight: calcTruckWeight(newTruckLoad)
    }

    const updatedAudit = [...audit, auditEntry]

    expect(mockClient.putItem).toHaveBeenCalledTimes(1)
    expect(mockClient.putItem).toHaveBeenCalledWith(
      { id, parcels: newTruckLoad, audit: updatedAudit },
      DDB_TABLE
    )
  })

  it('unloads a truck', async () => {
    getItem.mockResolvedValueOnce(truckRecord)
    const result = await unloadTruck(id, [parcels[0].id, parcels[2].id], client)

    const newTruckLoad = [parcels[1], parcels[3]]

    const auditEntry: AuditEntry = {
      timestamp,
      weight: calcTruckWeight(newTruckLoad)
    }

    const updatedAudit = [...audit, auditEntry]

    expect(getItem).toHaveBeenCalledTimes(1)
    expect(getItem).toHaveBeenCalledWith({
      TableName: DDB_TABLE,
      Key: {
        id
      }
    })

    expect(mockClient.putItem).toHaveBeenCalledTimes(1)
    expect(mockClient.putItem).toHaveBeenCalledWith(
      { id, parcels: newTruckLoad, audit: updatedAudit },
      DDB_TABLE
    )

    expect(result).toEqual([parcels[0], parcels[2]])
  })
})
