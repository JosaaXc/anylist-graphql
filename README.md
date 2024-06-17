<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
1. Copy env.template and rename to .env
2. docker compose up -d
3. yarn run start:dev
4. Visit http://localhost:3000/graphql
5. Execute the seed: executeSeed: Boolean! ( DO NOT THIS ON PRODUCTION( BTW ITS NOT POSIBLE ))

# production mode
3.1 yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```