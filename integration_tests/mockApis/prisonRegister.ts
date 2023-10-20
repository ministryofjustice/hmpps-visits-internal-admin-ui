import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'
import { PrisonContactDetails, PrisonRegisterPrison } from '../../server/data/prisonRegisterApiTypes'

export default {
  stubPrisons: (prisons: PrisonRegisterPrison[] = TestData.prisonRegisterPrisons()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/prisonRegister/prisons',
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
}
