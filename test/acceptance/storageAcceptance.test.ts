import request from 'superagent'
import { purgeAll, testDynamoClient } from '../awsTestClients'
import waitForExpect from 'wait-for-expect'
import { API, DDB_TABLE } from '../../src/constants'
import { testParcel } from '../testFactories'

const parcels = [testParcel(), testParcel()]
const createTruck = () => request.post(`${API}/trucks/create`)

describe('Trucker storage tests', () => {
  beforeAll(async () => {
    await purgeAll()
  })

  it('stores a new truck in dynamodb', async () => {
    const res = await createTruck()
    const id = res.body.id

    await waitForExpect(
      async () => {
        const truckRecord = await testDynamoClient.getItem({
          TableName: DDB_TABLE,
          Key: {
            id
          } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        })

        expect(truckRecord).toEqual({ Item: { id } })
      },
      8000,
      200
    )
  })

  it('stores a truck with parcels in dynamodb', async () => {
    const res = await createTruck()
    const id = res.body.id

    await request.post(`${API}/trucks/${id}/load`).send({ parcels })

    await waitForExpect(
      async () => {
        const truckRecord = await testDynamoClient.getItem({
          TableName: DDB_TABLE,
          Key: {
            id
          } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        })

        expect(truckRecord).toEqual({ Item: { id, parcels } })
      },
      8000,
      200
    )
  })
})
