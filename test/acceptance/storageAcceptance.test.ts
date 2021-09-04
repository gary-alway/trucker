import request from 'superagent'
import { purgeAll, testDynamoClient } from '../awsTestClients'
import { API, DDB_TABLE } from '../../src/constants'
import { testParcel } from '../testFactories'
import { calcTruckWeight } from '../../src/domain/truckService'

const parcels = [testParcel(), testParcel()]
const createTruck = () => request.post(`${API}/trucks/create`)

describe('Trucker storage tests', () => {
  beforeAll(async () => {
    await purgeAll()
  })

  it('stores a new truck in dynamodb', async () => {
    const res = await createTruck()
    const id = res.body.id

    const truckRecord = await testDynamoClient.getItem({
      TableName: DDB_TABLE,
      Key: {
        id
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    expect(truckRecord).toEqual({ Item: { id } })
  })

  it('stores a truck with parcels in dynamodb', async () => {
    const res = await createTruck()
    const id = res.body.id

    await request.post(`${API}/trucks/${id}/load`).send({ parcels })

    const truckRecord = await testDynamoClient.getItem({
      TableName: DDB_TABLE,
      Key: {
        id
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    expect(truckRecord).toEqual({
      Item: {
        id,
        parcels,
        audit: expect.arrayContaining([
          {
            timestamp: expect.any(String),
            weight: calcTruckWeight(parcels)
          }
        ])
      }
    })
  })

  it('unloads a truck with parcels in dynamodb', async () => {
    const res = await createTruck()
    const id = res.body.id

    await request.post(`${API}/trucks/${id}/load`).send({ parcels })
    await request
      .post(`${API}/trucks/${id}/unload`)
      .send({ parcels: [parcels[0].id] })

    const truckRecord = await testDynamoClient.getItem({
      TableName: DDB_TABLE,
      Key: {
        id
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    expect(truckRecord).toMatchObject({
      Item: {
        id,
        parcels: [parcels[1]],
        audit: expect.arrayContaining([
          {
            timestamp: expect.any(String),
            weight: calcTruckWeight(parcels)
          },
          {
            timestamp: expect.any(String),
            weight: calcTruckWeight([parcels[1]])
          }
        ])
      }
    })
  })
})
