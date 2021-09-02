import { wrap } from 'lambda-wrapper'
import * as loader from './loader'
import * as truckService from '../domain/truckService'
import { createAPIGatewayEventMock } from '../../test/proxyEventMock'
import { datatype } from 'faker'
import { testParcel } from '../../test/testFactories'

const wrapped = wrap(loader, { handler: 'endpoint' })
const loadTruck = jest.spyOn(truckService, 'loadTruck')
const id = datatype.uuid()
const parcels = [testParcel(), testParcel()]

describe('POST /trucks/{id}/load', () => {
  beforeEach(jest.clearAllMocks)

  it('loads up a truck', async () => {
    loadTruck.mockResolvedValueOnce(undefined)
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/load',
      pathParameters: {
        id
      },
      body: JSON.stringify({ parcels })
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(200)
    expect(loadTruck).toHaveBeenCalledTimes(1)
    expect(loadTruck).toHaveBeenCalledWith(id, parcels)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'ok'
    })
  })

  it('handles errors', async () => {
    loadTruck.mockRejectedValueOnce(new Error('boom'))
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/load',
      pathParameters: {
        id
      },
      body: JSON.stringify({ parcels })
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error'
    })
  })

  it('rejects an empty payload', async () => {
    loadTruck.mockResolvedValueOnce(undefined)
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/load',
      pathParameters: {
        id
      },
      body: ''
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error'
    })
    expect(loadTruck).not.toHaveBeenCalled()
  })

  it('rejects an incorrect payload', async () => {
    loadTruck.mockResolvedValueOnce(undefined)
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/load',
      pathParameters: {
        id
      },
      body: JSON.stringify({ test: 123 })
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(400)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error'
    })
    expect(loadTruck).not.toHaveBeenCalled()
  })
})
