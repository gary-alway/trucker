import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import { APIGatewayEvent } from 'aws-lambda'
import { trucksStatus } from '../domain/truckService'
import { path } from 'ramda'
import { APIResponse } from '../types'

const handler = async ({
  pathParameters
}: APIGatewayEvent): Promise<APIResponse> => {
  const id = path<string>(['id'], pathParameters)
  const data = await trucksStatus(id!)

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      data
    })
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
