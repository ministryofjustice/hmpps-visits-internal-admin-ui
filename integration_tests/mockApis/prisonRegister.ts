import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'
import { PrisonContactDetails, PrisonName } from '../../server/data/prisonRegisterApiTypes'

export default {
  stubPrisonNames: (prisons: PrisonName[] = TestData.prisonNames()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/prisonRegister/prisons/names',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisons,
      },
    })
  },

  stubGetPrisonContactDetails: ({
    prisonCode,
    prisonContactDetails = TestData.prisonContactDetails(),
  }: {
    prisonCode: string
    prisonContactDetails: PrisonContactDetails
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prisonRegister/secure/prisons/id/${prisonCode}/department/contact-details?departmentType=SOCIAL_VISIT`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonContactDetails,
      },
    })
  },

  stubPrisonRegisterPing: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/prisonRegister/health/ping',
      },
      response: {
        status: 200,
      },
    })
  },
}
