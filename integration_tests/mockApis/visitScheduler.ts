import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'
import { components } from '../../server/@types/visit-scheduler-api'
import { SessionTemplatesRangeType } from '../../server/data/visitSchedulerApiTypes'

type Prison = components['schemas']['PrisonDto']

export default {
  stubGetAllPrisons: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/visitScheduler/admin/prisons',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prisons(),
      },
    })
  },
  stubGetPrison: (prison: Prison): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/prisons/prison/${prison.code}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    })
  },
  stubCreatePrison: (prison: Prison): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/prisons/prison',
        bodyPatterns: [
          {
            equalToJson: {
              active: prison.active,
              code: prison.code,
              excludeDates: prison.excludeDates,
            },
          },
        ],
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    })
  },
  stubActivatePrison: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonCode}/activate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prison({ active: true }),
      },
    })
  },
  stubDeactivatePrison: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/prisons/prison/${prisonCode}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prison({ active: false }),
      },
    })
  },
  stubGetSessionTemplates: ({
    prisonCode,
    rangeType,
  }: {
    prisonCode: string
    rangeType: SessionTemplatesRangeType
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/session-templates?prisonCode=${prisonCode}&rangeType=${rangeType}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: [TestData.sessionTemplate()],
      },
    })
  },
}
