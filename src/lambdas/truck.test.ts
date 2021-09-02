import { wrap } from 'lambda-wrapper'
import * as truck from './truck'
import * as truckService from '../domain/truckService'
import { createAPIGatewayEventMock } from '../../test/proxyEventMock'
import { testTruck } from '../../test/testFactories'

const wrapped = wrap(truck, { handler: 'endpoint' })
const trucksStatus = jest.spyOn(truckService, 'trucksStatus')

describe('GET /trucks/{id}', () => {
  it('returns a truck', async () => {
    const data = testTruck()
    trucksStatus.mockResolvedValueOnce(data)
    const event = createAPIGatewayEventMock({
      httpMethod: 'GET',
      path: '/trucks',
      pathParameters: { id: '1' }
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(200)
    expect(trucksStatus).toHaveBeenCalledTimes(1)
    expect(trucksStatus).toHaveBeenCalledWith('1')
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'ok',
      data
    })
  })

  it('handles errors', async () => {
    trucksStatus.mockRejectedValueOnce(new Error('boom'))
    const event = createAPIGatewayEventMock({
      httpMethod: 'GET',
      path: '/trucks/',
      pathParameters: { id: '1' }
    })

    const result = await wrapped.run(event)

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toMatchObject({
      status: 'error'
    })
  })
})
