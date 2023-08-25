import { SuperAgentRequest } from 'superagent'
import { stubFor } from '../wiremock'
import TestData from '../../../server/routes/testutils/testData'
import {
  SessionTemplatesRangeType,
  SessionTemplate,
  CreateSessionTemplateDto,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplateVisitStatsDto,
} from '../../../server/data/visitSchedulerApiTypes'

export default {
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
  stubGetTemplateStats: ({
    requestVisitStatsDto,
    reference,
    visitStats,
  }: {
    requestVisitStatsDto: RequestSessionTemplateVisitStatsDto
    reference: string
    visitStats: SessionTemplateVisitStatsDto
  }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: `/visitScheduler/admin/session-templates/template/${reference}/stats`,
        bodyPatterns: [
          {
            equalToJson: {
              visitsFromDate: requestVisitStatsDto.visitsFromDate,
            },
          },
        ],
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: visitStats,
      },
    })
  },
}
