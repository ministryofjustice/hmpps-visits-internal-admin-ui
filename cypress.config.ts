import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import prisonRegister from './integration_tests/mockApis/prisonRegister'
import categoryGroups from './integration_tests/mockApis/visitScheduler/categoryGroups'
import incentiveGroups from './integration_tests/mockApis/visitScheduler/incentiveGroups'
import locationGroups from './integration_tests/mockApis/visitScheduler/locationGroups'
import prisons from './integration_tests/mockApis/visitScheduler/prisons'
import sessionTemplates from './integration_tests/mockApis/visitScheduler/sessionTemplates'
import visits from './integration_tests/mockApis/visitScheduler/visits'

export default defineConfig({
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
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...auth,
        ...tokenVerification,

        ...prisonRegister,

        // visit scheduler mock APIs
        ...categoryGroups,
        ...incentiveGroups,
        ...locationGroups,
        ...prisons,
        ...sessionTemplates,
        ...visits,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
    experimentalRunAllSpecs: true,
  },
})
