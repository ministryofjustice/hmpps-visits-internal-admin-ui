# hmpps-visits-internal-admin-ui
[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fhmpps-visits-internal-admin-ui)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#hmpps-visits-internal-admin-ui "Link to report")
[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-visits-internal-admin-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-visits-internal-admin-ui)

Allows internal staff to administer prison visit bookings system.

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker compose pull`

`docker compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* redis - session store and token caching
* prison-register - look up names of prisons from Prison codes
* visit-scheduler - all VSiP admin operations

### Running the app for development

It is simplest to use HMPPS Auth dev, in which case no dependencies need to be started locally.

Install dependencies using `npm install`, ensuring you are using `node v20.x` and `npm v10.x`

Note: Using `nvm` (or [fnm](https://github.com/Schniz/fnm)), run `nvm install --latest-npm` within the repository folder to use the correct version of node, and the latest version of npm. This matches the `engines` config in `package.json` and the CircleCI build config.

Using credentials from the dev namespace, create a `.env` local settings file
```bash
REDIS_HOST=localhost
HMPPS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
HMPPS_AUTH_EXTERNAL_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
NOMIS_AUTH_URL=https://sign-in-dev.hmpps.service.justice.gov.uk/auth
MANAGE_USERS_API_URL=https://manage-users-api-dev.hmpps.service.justice.gov.uk
NODE_ENV=development

# Use credentials from the dev namespace for API and SYSTEM client
API_CLIENT_ID=clientid
API_CLIENT_SECRET=clientsecret
SYSTEM_CLIENT_ID=clientid
SYSTEM_CLIENT_SECRET=clientsecret

PRISON_REGISTER_API_URL="https://prison-register-dev.hmpps.service.justice.gov.uk"
# If running prison register locally:
# PRISON_REGISTER_API_URL: "http://localhost:8082"

VISIT_SCHEDULER_API_URL="https://visit-scheduler-dev.prison.service.justice.gov.uk"
```

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db and wiremock instance by:

`docker compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`


## Imported types

Some TypeScript types are imported via the Open API (Swagger) docs, e.g. from the Visit Scheduler, Prisoner Contact Registry, Prison API, etc.

These are stored in [`./server/@types/`](./server/@types/), for example [`./server/@types/visit-scheduler-api.d.ts`](./server/@types/visit-scheduler-api.d.ts). There are also some corresponding files such as [`./server/data/visitSchedulerApiTypes.ts`](./server/data/visitSchedulerApiTypes.ts) that contain the particular imported types that are actually used in the project.

For example, to update types for the Visit Scheduler use the [API docs URL](https://visit-scheduler-dev.prison.service.justice.gov.uk/v3/api-docs) from [Swagger](https://visit-scheduler-dev.prison.service.justice.gov.uk/swagger-ui/index.html) and the appropriate output filename:

```
npx openapi-typescript https://visit-scheduler-dev.prison.service.justice.gov.uk/v3/api-docs --output ./server/@types/visit-scheduler-api.d.ts
```

The downloaded file will need tidying (e.g. single rather than double quotes, etc):
* `npm run lint-fix` should tidy most of the formatting
* there may be some remaining errors about empty interfaces; these can be fixed be either removing the line or putting `// eslint-disable-next-line @typescript-eslint/no-empty-interface` before.

After updating the types, running the TypeScript complier across the project (`npx tsc`) will show any issues that have been caused by the change.

### Import all types
To download and update all the API types and tidy up the files, run:

```
./bin/update-types.sh
```
