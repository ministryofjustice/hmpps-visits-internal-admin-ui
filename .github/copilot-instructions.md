# Copilot Instructions

## Project overview

An internal admin UI for the HMPPS Visit Someone in Prison (VSiP) service. Staff use it to manage prisons, visit session templates, location/category/incentive groups, excluded dates, booker accounts, and visit allocations. Built on the [hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript) pattern.

**Stack:** Node.js 24 / Express 5 / TypeScript / Nunjucks (views) / GovUK Frontend + MoJ Frontend design system / Jest (unit) / Cypress (integration) / Redis (sessions/token cache)

## Build, test, and lint commands

```bash
npm run setup          # install deps (npm ci)
npm run build          # compile SCSS + TypeScript + copy views
npm run start:dev      # dev server with watch (TypeScript, views, SCSS, nodemon)

npm run lint           # ESLint (zero warnings policy)
npm run lint-fix       # auto-fix ESLint/Prettier issues
npm run typecheck      # tsc type-check (app + integration_tests)

npm run test           # Jest unit tests (all)
npx jest path/to/file  # run a single test file
npx jest -t "test name pattern"  # run tests matching a pattern

npm run int-test       # Cypress headless (requires feature server + wiremock)
npm run int-test-ui    # Cypress UI mode
```

To run integration tests locally:
```bash
docker compose -f docker-compose-test.yml up   # starts Redis + Wiremock
npm run start-feature                           # feature-flag server
npm run int-test                                # or int-test-ui
```

To update OpenAPI-generated types from a backend service:
```bash
./bin/update-types.sh                           # updates all API types
npx openapi-typescript <api-docs-url> --output ./server/@types/<name>-api.d.ts
npm run lint-fix                                # tidy formatting
npx tsc                                         # check for type regressions
```

## Architecture

### Three-layer pattern: Controller → Service → API Client

Every feature follows this flow:

1. **Route / Controller** (`server/routes/`) — receives HTTP requests, calls services, renders Nunjucks views. Controllers return `RequestHandler` functions; they never talk to API clients directly.
2. **Service** (`server/services/`) — orchestrates business logic and calls API clients. Services receive singleton client instances (injected from `dataAccess()`) and call their methods directly.
3. **API Client** (`server/data/`) — extends `RestClient` from `@ministryofjustice/hmpps-rest-client`. One class per external API (e.g. `VisitSchedulerApiClient`, `BookerRegistryApiClient`). Each method calls `this.get/post/put/delete(...)` with `asSystem()` to obtain and use a system-level token automatically.

The wiring happens in `server/data/index.ts` (client instantiation + `dataAccess()`) and `server/services/index.ts` (service construction + the `Services` type used throughout routes).

### Authentication and tokens

- **User token**: stored on `req.user.token` after OAuth2 sign-in via `passport-oauth2`. Token verification on every request is handled in `setUpAuthentication.ts` using `VerificationClient` from `@ministryofjustice/hmpps-auth-clients`.
- **System client token**: obtained automatically by `@ministryofjustice/hmpps-rest-client` when API client methods call `asSystem()`. The `AuthenticationClient` (from `@ministryofjustice/hmpps-auth-clients`) handles fetching and caching the token in Redis (or in-memory in dev). Services do not need to handle tokens directly.
- The current user is available in controllers via `res.locals.user` (typed as `HmppsUser` via `server/@types/express/index.d.ts`). It is populated by JWT decode in `setUpCurrentUser.ts` — no API call needed.

### TypeScript types from OpenAPI

Backend API types live in `server/@types/<name>-api.d.ts` (generated) and the subset actually used is re-exported in `server/data/<name>ApiTypes.ts`. Always import domain types from the `*ApiTypes.ts` file, not the raw `.d.ts` directly.

App-specific types (e.g. `Prison`, `MoJAlert`, `FlashErrorMessage`) are in `server/@types/visits-admin.d.ts`.

Route parameter shapes (e.g. `PrisonParams`, `PrisonReferenceParams`) are defined in `server/@types/requestParameterTypes.ts` and used as the generic on `RequestHandler<Params>`.

### Views

Nunjucks templates in `server/views/pages/`. Partials and macros in `server/views/partials/` and `server/views/components/`. Uses GovUK Frontend and MoJ Frontend components. Custom Nunjucks filters are registered in `server/utils/nunjucksSetup.ts`.

### Flash messages

Three typed flash channels exist (typed in `server/@types/express/index.d.ts`):
- `errors` — `ValidationError[]` or `FlashErrorMessage[]` for form validation
- `formValues` — `FlashFormValues[]` for repopulating forms after a failed submit
- `messages` — `MoJAlert[]` for success/info banners after redirect

## Key conventions

### Adding a new feature area

1. Create an API client in `server/data/` extending `RestClient` from `@ministryofjustice/hmpps-rest-client`. Each method calls `this.get/post/put/delete(...)` with `asSystem()` as the second argument.
2. Instantiate the client in `server/data/index.ts`, passing `hmppsAuthClient` to the constructor.
3. Create a service in `server/services/` accepting the client instance.
4. Register the service in `server/services/index.ts` and add it to the `Services` type.
5. Create controller(s) in `server/routes/<area>/` accepting services via constructor.
6. Wire routes in `server/routes/<area>/index.ts` and include in `server/routes/index.ts`.

### Testing controllers

Controller unit tests use `supertest` + `cheerio` against a real Express app built by `appWithAllRoutes` (`server/routes/testutils/appSetup.ts`). Mock services come from `server/services/testutils/mocks.ts` (auto-mocked with `jest.mock('..')`). Test data factories are in `server/routes/testutils/testData.ts`.

```typescript
const prisonService = createMockPrisonService()
const app = appWithAllRoutes({ services: { prisonService } })

it('renders page', () => {
  prisonService.getPrison.mockResolvedValue(TestData.prison())
  return request(app).get('/prisons/HEI/...').expect(200)
})
```

### Testing services

Service tests use `nock` to intercept HTTP calls to downstream APIs, or mock the API client directly with `jest.fn()`.

### Integration test mock APIs

Wiremock stubs for integration tests are in `integration_tests/mockApis/`. Page object models are in `integration_tests/pages/`. Tests are in `integration_tests/e2e/`.

### Logging

Use `logger` from `../../logger` (bunyan). Log significant admin actions with `logger.info` including the `username` for audit purposes (see `prisonService.ts` for examples).

### Config / environment variables

All config is centralised in `server/config.ts`. New env vars should be added there with appropriate defaults and `requireInProduction` where needed.
