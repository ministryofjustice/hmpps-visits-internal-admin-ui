import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'
import { components } from '../../server/@types/visit-scheduler-api'
import { SessionTemplatesRangeType, SessionTemplate } from '../../server/data/visitSchedulerApiTypes'

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
    sessionTemplates = [TestData.sessionTemplate()],
  }: {
    prisonCode: string
    rangeType: SessionTemplatesRangeType
    sessionTemplates: Array<SessionTemplate>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/session-templates?prisonCode=${prisonCode}&rangeType=${rangeType}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: sessionTemplates,
      },
    })
  },
  stubGetSessionTemplate: ({
    sessionTemplate = TestData.sessionTemplate(),
  }: {
    sessionTemplate: SessionTemplate
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: sessionTemplate,
      },
    })
  },

  stubActivateSessionTemplate: ({
    sessionTemplate = TestData.sessionTemplate(),
    activeSessionTemplate = TestData.sessionTemplate({ active: true, reference: '-act.dcc.0f' }),
  }: {
    sessionTemplate: SessionTemplate
    activeSessionTemplate: SessionTemplate
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}/activate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: activeSessionTemplate,
      },
    })
  },
  stubDeactivateSessionTemplate: ({
    sessionTemplate = TestData.sessionTemplate(),
    deactivatedSessionTemplate = TestData.sessionTemplate({ active: false, reference: '-ina.dcc.0f' }),
  }: {
    sessionTemplate: SessionTemplate
    deactivatedSessionTemplate: SessionTemplate
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: deactivatedSessionTemplate,
      },
    })
  },

  stubDeleteSessionTemplate: ({ sessionTemplate }: { sessionTemplate: SessionTemplate }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: 'session template deleted',
      },
    })
  },

  stubDeleteSessionTemplateFailure: ({ sessionTemplate }: { sessionTemplate: SessionTemplate }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'DELETE',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}`,
      },
      response: {
        status: 400,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      },
    })
  },
}
