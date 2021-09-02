import { wrap } from 'lambda-wrapper'
import * as creator from './creator'
import * as truckService from '../domain/truckService'
import { createAPIGatewayEventMock } from '../../test/proxyEventMock'
import { datatype } from 'faker'

const wrapped = wrap(creator, { handler: 'endpoint' })
const createTruck = jest.spyOn(truckService, 'createTruck')

describe('POST /trucks/create', () => {
  it('creates a truck', async () => {
    const id = datatype.uuid()
    createTruck.mockResolvedValueOnce(id)
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/create'
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(200)
    expect(createTruck).toHaveBeenCalledTimes(1)
    expect(createTruck).toHaveBeenCalledWith()
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'ok',
      id
    })
  })

  it('handles errors', async () => {
    createTruck.mockRejectedValueOnce(new Error('boom'))
    const event = createAPIGatewayEventMock({
      httpMethod: 'POST',
      path: '/trucks/create'
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error'
    })
  })
})
