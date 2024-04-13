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

  stubGetPrisonContactDetailsNotFound: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/prisonRegister/secure/prisons/id/${prisonCode}/department/contact-details?departmentType=SOCIAL_VISIT`,
      },
      response: {
        status: 404,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },

  stubCreatePrisonContactDetails: ({
    prisonCode,
    prisonContactDetails,
  }: {
    prisonCode: string
    prisonContactDetails: PrisonContactDetails
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/prisonRegister/secure/prisons/id/${prisonCode}/department/contact-details`,
        bodyPatterns: [
          {
            equalToJson: {
              type: prisonContactDetails.type,
              emailAddress: prisonContactDetails.emailAddress,
              phoneNumber: prisonContactDetails.phoneNumber,
              webAddress: prisonContactDetails.webAddress,
            },
          },
        ],
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prisonContactDetails,
      },
    })
  },

  stubUpdatePrisonContactDetails: ({
    prisonCode,
    prisonContactDetails,
  }: {
    prisonCode: string
    prisonContactDetails: PrisonContactDetails
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/prisonRegister/secure/prisons/id/${prisonCode}/department/contact-details?removeIfNull=true`,
        bodyPatterns: [
          {
            equalToJson: {
              type: prisonContactDetails.type,
              emailAddress: prisonContactDetails.emailAddress,
              phoneNumber: prisonContactDetails.phoneNumber,
              webAddress: prisonContactDetails.webAddress,
            },
          },
        ],
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
