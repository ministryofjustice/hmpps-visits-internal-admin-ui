import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'
import { components } from '../../server/@types/visit-scheduler-api'

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
  stubGetPrison: (prisonId: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/config/prisons/${prisonId}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prison,
      },
    })
  },
  stubCreatePrison: (prison: Prison): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/config/prisons/prison',
        data: <Prison>{
          active: prison.active,
          code: prison.code,
          excludeDates: prison.excludeDates,
        },
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: prison,
      },
    })
  },
  stubActivePrison: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/config/prisons/prison/${prisonCode}/activate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...TestData.prison, active: true },
      },
    })
  },
  stubDeactivePrison: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/config/prisons/prison/${prisonCode}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...TestData.prison, active: false },
      },
    })
  },
}
