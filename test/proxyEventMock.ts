import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayEventRequestContextWithAuthorizer
} from 'aws-lambda'
import createEvent from '@serverless/event-mocks'

const createAPIGatewayProxyEventMock = (
  apiGatewayProxyEvent: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent => ({
  httpMethod: '',
  path: '',
  multiValueHeaders: {},
  isBase64Encoded: false,
  body: '',
  headers: {},
  multiValueQueryStringParameters: null,
  pathParameters: null,
  queryStringParameters: null,
  requestContext:
    undefined as unknown as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
  resource: '',
  stageVariables: null,
  ...apiGatewayProxyEvent
})

export const createAPIGatewayEventMock = (
  apiGatewayProxyEvent: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent =>
  createEvent(
    'aws:apiGateway',
    createAPIGatewayProxyEventMock(apiGatewayProxyEvent)
  )
