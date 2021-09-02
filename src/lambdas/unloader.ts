import { APIGatewayEvent } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from '../middleware/httpErrorHandler'
import createHttpError from 'http-errors'
import { path, pathOr } from 'ramda'
import { APIResponse } from '../types'
import { unloadTruck } from '../domain/truckService'

const handler = async ({
  body,
  pathParameters
}: APIGatewayEvent): Promise<APIResponse> => {
  const id = path<string>(['id'], pathParameters)

  if (!body) {
    throw createHttpError(400)
  }

  const payload = JSON.parse(body)

  const parcels = pathOr<string[] | undefined>(undefined, ['parcels'], payload)

  if (!parcels || !Array.isArray(parcels)) {
    throw createHttpError(400)
  }

  const result = await unloadTruck(id!, parcels)

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'ok',
      data: {
        parcels: result
      }
    })
  }
}

export const endpoint = middy(handler).use(httpErrorHandler())
