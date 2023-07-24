import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import TestData from '../../server/routes/testutils/testData'
import { components } from '../../server/@types/visit-scheduler-api'
import {
  SessionTemplatesRangeType,
  SessionTemplate,
  IncentiveLevelGroup,
  LocationGroup,
  CategoryGroup,
  CreateSessionTemplateDto,
} from '../../server/data/visitSchedulerApiTypes'

type Prison = components['schemas']['PrisonDto']

export default {
  stubLocationGroups: ({
    prisonCode,
    body = [TestData.locationGroup()],
  }: {
    prisonCode: string
    body: Array<LocationGroup>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/location-groups/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    })
  },
  stubIncentiveGroups: ({
    prisonCode,
    body = [TestData.incentiveLevelGroup()],
  }: {
    prisonCode: string
    body: Array<IncentiveLevelGroup>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/incentive-groups/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    })
  },
  stubCategoryGroups: ({
    prisonCode,
    body = [TestData.categoryGroup()],
  }: {
    prisonCode: string
    body: Array<CategoryGroup>
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: `/visitScheduler/admin/category-groups/${prisonCode}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: body,
      },
    })
  },
  stubGetAllPrisons: (): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/visitScheduler/admin/prisons',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: TestData.prisonDtos(),
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
        jsonBody: TestData.prisonDto({ active: true }),
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
        jsonBody: TestData.prisonDto({ active: false }),
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

  stubActivateSessionTemplate: (sessionTemplate = TestData.sessionTemplate()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}/activate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...sessionTemplate, active: true },
      },
    })
  },
  stubDeactivateSessionTemplate: (sessionTemplate = TestData.sessionTemplate()): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}/deactivate`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { ...sessionTemplate, active: false },
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
        jsonBody: {
          developerMessage: `Failed to delete session template with reference - ${sessionTemplate.reference}`,
        },
      },
    })
  },

  stubCreateSessionTemplatePost: ({
    createSessionTemplate,
    sessionTemplate,
  }: {
    createSessionTemplate: CreateSessionTemplateDto
    sessionTemplate: SessionTemplate
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/session-templates/template',
        bodyPatterns: [
          {
            equalToJson: {
              name: createSessionTemplate.name,
              weeklyFrequency: createSessionTemplate.weeklyFrequency,
              dayOfWeek: createSessionTemplate.dayOfWeek,
              prisonId: createSessionTemplate.prisonId,
              sessionCapacity: createSessionTemplate.sessionCapacity,
              sessionDateRange: createSessionTemplate.sessionDateRange,
              sessionTimeSlot: createSessionTemplate.sessionTimeSlot,
              visitRoom: createSessionTemplate.visitRoom,
              categoryGroupReferences: createSessionTemplate.categoryGroupReferences,
              incentiveLevelGroupReferences: createSessionTemplate.incentiveLevelGroupReferences,
              locationGroupReferences: createSessionTemplate.locationGroupReferences,
            },
          },
        ],
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: sessionTemplate,
      },
    })
  },
}
