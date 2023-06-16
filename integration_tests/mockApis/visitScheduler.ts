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
  stubCreatePrison: (prison: Prison): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/admin/prisons/prison',
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
        url: `/admin/prisons/prison/${prisonCode}/activate`,
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
        url: `/admin/prisons/prison/${prisonCode}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...TestData.prison, active: false },
      },
    })
  },
  stubGetSessionTemplate: (prisonCode: string): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/admin/prisons/prison/${prisonCode}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...TestData.prison },
        // TODO: return sessionTemplate
      },
    })
  },
}
