import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import manageUsersApi from './integration_tests/mockApis/manageUsersApi'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import bookerRegistry from './integration_tests/mockApis/bookerRegistry'
import prisonRegister from './integration_tests/mockApis/prisonRegister'
import categoryGroups from './integration_tests/mockApis/visitScheduler/categoryGroups'
import incentiveGroups from './integration_tests/mockApis/visitScheduler/incentiveGroups'
import locationGroups from './integration_tests/mockApis/visitScheduler/locationGroups'
import visitAllocation from './integration_tests/mockApis/visitAllocation'
import visitScheduler from './integration_tests/mockApis/visitScheduler/visitScheduler'
import prisons from './integration_tests/mockApis/visitScheduler/prisons'
import sessionTemplates from './integration_tests/mockApis/visitScheduler/sessionTemplates'
import visits from './integration_tests/mockApis/visitScheduler/visits'

export default defineConfig({
  allowCypressEnv: false,
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  viewportWidth: 1280,
  viewportHeight: 1400,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...manageUsersApi,
        ...tokenVerification,

        ...bookerRegistry,
        ...prisonRegister,

        // visit scheduler mock APIs
        ...categoryGroups,
        ...incentiveGroups,
        ...locationGroups,
        ...prisons,
        ...sessionTemplates,
        ...visits,
        ...visitAllocation,
        ...visitScheduler,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
