import middy from '@middy/core'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
} from 'aws-lambda'
import { pathOr } from 'ramda'

export const httpErrorHandler = (): middy.MiddlewareObject<
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context
> => {
  return {
    onError: (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      const { error } = handler

      const statusCode = pathOr(500, ['statusCode'], error)

      const errors =
        statusCode < 500 ? [error] : [{ message: 'Something went wrong' }]

      Object.assign(handler, {
        response: {
          statusCode,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
          },
          body: JSON.stringify({ status: 'error', errors })
        }
      })

      return next()
    }
  }
}
