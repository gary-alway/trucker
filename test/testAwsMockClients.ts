import { DynamoClient } from '../src/clients/dynamoClient'

export const createDynamoMockClient = ({
  putItem = jest.fn(),
  updateItem = jest.fn(),
  getItem = jest.fn(),
  deleteItem = jest.fn(),
  query = jest.fn(),
  truncateTable = jest.fn(),
  scan = jest.fn()
} = {}): DynamoClient => ({
  putItem,
  updateItem,
  getItem,
  deleteItem,
  query,
  truncateTable,
  scan
})
