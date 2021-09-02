import { wrap } from 'lambda-wrapper'
import * as unloader from './unloader'
import * as truckService from '../domain/truckService'
import { createAPIGatewayEventMock } from '../../test/proxyEventMock'
import { datatype } from 'faker'
import { testParcel } from '../../test/testFactories'

const wrapped = wrap(unloader, { handler: 'endpoint' })
const unloadTruck = jest.spyOn(truckService, 'unloadTruck')
const id = datatype.uuid()
const parcels = [testParcel(), testParcel()]
const parcelsOffLoad = [testParcel(), testParcel()]

describe('POST /trucks/{id}/unload', () => {
  beforeEach(jest.clearAllMocks)

  it('unloads from a truck', async () => {
    unloadTruck.mockResolvedValueOnce(parcelsOffLoad)
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/unload',
      pathParameters: {
        id
      },
      body: JSON.stringify({ parcels })
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(200)
    expect(unloadTruck).toHaveBeenCalledTimes(1)
    expect(unloadTruck).toHaveBeenCalledWith(id, parcels)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'ok',
      data: {
        parcels: parcelsOffLoad
      }
    })
  })

  it('handles errors', async () => {
    unloadTruck.mockRejectedValueOnce(new Error('boom'))
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/unload',
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
    unloadTruck.mockResolvedValueOnce([])
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/unload',
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
    expect(unloadTruck).not.toHaveBeenCalled()
  })

  it('rejects an incorrect payload', async () => {
    unloadTruck.mockResolvedValueOnce([])
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/{id}/unload',
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
    expect(unloadTruck).not.toHaveBeenCalled()
  })
})
