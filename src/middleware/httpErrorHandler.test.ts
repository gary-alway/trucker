import createHttpError from 'http-errors'
import { Context, Callback } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from './httpErrorHandler'

describe('error handler onError', () => {
  it('should use a generic message for status code >= 500', () => {
    const emptyHandler: middy.HandlerLambda = {
      event: {},
      context: {} as unknown as Context,
      response: {},
      error: createHttpError(500, 'boom'),
      callback: null as unknown as Callback
    }

    const next = jest.fn()

    const { onError } = httpErrorHandler()
    onError && onError(emptyHandler, next)

    expect(emptyHandler.response).toEqual({
      body: JSON.stringify({
        status: 'error',
        errors: [{ message: 'Something went wrong' }]
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500
    })
  })

  it('should return response with statusCode provided and error message', () => {
    const emptyHandler: middy.HandlerLambda = {
      event: {},
      context: {} as unknown as Context,
      response: {},
      error: createHttpError(400, 'Boom'),
      callback: null as unknown as Callback
    }

    const next = jest.fn()

    const { onError } = httpErrorHandler()
    onError && onError(emptyHandler, next)

    expect(emptyHandler.response).toEqual({
      body: JSON.stringify({
        status: 'error',
        errors: [{ message: 'Boom' }]
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 400
    })
  })

  it('should return response with status code 500 when no statusCode provided', () => {
    const error = new Error('boom')
    const emptyHandler: middy.HandlerLambda = {
      event: {},
      context: {} as unknown as Context,
      response: {},
      error,
      callback: null as unknown as Callback
    }

    const next = jest.fn()

    const { onError } = httpErrorHandler()
    onError && onError(emptyHandler, next)

    expect(emptyHandler.response).toEqual({
      body: JSON.stringify({
        status: 'error',
        errors: [{ message: 'Something went wrong' }]
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500
    })
  })
})
