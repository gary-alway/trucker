# Trucker

A parcel service using [localstack]() and [serverless]()

## Prerequisites

- [docker](https://www.docker.com/)
- [awslocal-cli](https://github.com/localstack/awscli-local)

## Testing

To run the unit tests

```bash
yarn test
```

## Setup and running (local development)

```bash
yarn local:up

yarn dev

# acceptance tests require the server to be running
yarn test:acceptance

# delete all data from Dynamo
yarn purge
```

[query API](http://localhost:21001/trucks)

## Query local Dynamo

```bash
awslocal dynamodb scan --table-name trucker
```

## Teardown

```bash
yarn local:down
```
