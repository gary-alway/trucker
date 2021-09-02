import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { IS_OFFLINE, LOCAL_AWS_CONFIG } from '../constants'
import { createDynamoClient, DynamoClient } from './dynamoClient'

const dynamoInstance = Object.freeze(
  createDynamoClient(
    new DocumentClient(IS_OFFLINE ? LOCAL_AWS_CONFIG : undefined)
  )
)

export const getDynamoClient = (): DynamoClient => dynamoInstance
