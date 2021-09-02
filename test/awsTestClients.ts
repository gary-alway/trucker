import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createDynamoClient } from '../src/clients/dynamoClient'
import { DDB_TABLE, DDB_TABLE_PK, LOCAL_AWS_CONFIG } from '../src/constants'

export const testDynamoClient = createDynamoClient(
  new DocumentClient(LOCAL_AWS_CONFIG)
)

export const purgeAll = async (): Promise<void> =>
  testDynamoClient.truncateTable(DDB_TABLE, DDB_TABLE_PK)
