import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { createTruck } from '../domain/truckService'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { APIResponse } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handler = async (_: APIGatewayEvent): Promise<APIResponse> => {
  const id = await createTruck()

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      id
    })
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
