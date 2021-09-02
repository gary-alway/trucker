export const { IS_OFFLINE } = process.env
export const LOCAL_AWS_CONFIG = {
  region: 'us-east-1',
  accessKeyId: 'root',
  secretAccessKey: 'root',
  endpoint: 'http://localhost:4566'
}
export const DDB_TABLE = 'trucker'
export const DDB_TABLE_PK = 'id'
export const API = 'http://localhost:21001'
