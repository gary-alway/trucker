import { wrap } from 'lambda-wrapper'
import * as trucks from './trucks'
import * as truckService from '../domain/truckService'
import { createAPIGatewayEventMock } from '../../test/proxyEventMock'
import { testTruck } from '../../test/testFactories'

const wrapped = wrap(trucks, { handler: 'endpoint' })
const getTrucks = jest.spyOn(truckService, 'getTrucks')

describe('GET /trucks/', () => {
  it('returns all trucks', async () => {
    const data = [testTruck(), testTruck()]
    getTrucks.mockResolvedValueOnce(data)
    const event = createAPIGatewayEventMock({
      httpMethod: 'GET',
      path: '/trucks'
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(200)
    expect(getTrucks).toHaveBeenCalledTimes(1)
    expect(getTrucks).toHaveBeenCalledWith()
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'ok',
      data
    })
  })

  it('handles errors', async () => {
    getTrucks.mockRejectedValueOnce(new Error('boom'))
    const event = createAPIGatewayEventMock({
      httpMethod: 'GET',
      path: '/trucks/'
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error'
    })
  })
})
