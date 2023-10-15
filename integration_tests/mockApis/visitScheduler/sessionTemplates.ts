import { SuperAgentRequest } from 'superagent'
import { format } from 'date-fns'
import { stubFor } from '../wiremock'
import TestData from '../../../server/routes/testutils/testData'
import {
  SessionTemplatesRangeType,
  SessionTemplate,
  RequestSessionTemplateVisitStatsDto,
  SessionTemplateVisitStatsDto,
} from '../../../server/data/visitSchedulerApiTypes'

export default {
  stubGetSessionTemplates: ({
    prisonCode,
    rangeType = 'CURRENT_OR_FUTURE',
    sessionTemplates = [],
  }: {
    prisonCode: string
    rangeType: SessionTemplatesRangeType
    sessionTemplates: SessionTemplate[]
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

  stubGetSingleSessionTemplate: ({
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

  stubCreateSessionTemplate: ({ sessionTemplate }: { sessionTemplate: SessionTemplate }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/visitScheduler/admin/session-templates/template',
        bodyPatterns: [
          {
            equalToJson: {
              name: sessionTemplate.name,
              weeklyFrequency: sessionTemplate.weeklyFrequency,
              dayOfWeek: sessionTemplate.dayOfWeek,
              prisonId: sessionTemplate.prisonId,
              sessionCapacity: sessionTemplate.sessionCapacity,
              sessionDateRange: sessionTemplate.sessionDateRange,
              sessionTimeSlot: sessionTemplate.sessionTimeSlot,
              visitRoom: sessionTemplate.visitRoom,
              categoryGroupReferences: sessionTemplate.prisonerCategoryGroups.map(group => group.reference),
              incentiveLevelGroupReferences: sessionTemplate.prisonerIncentiveLevelGroups.map(group => group.reference),
              locationGroupReferences: sessionTemplate.permittedLocationGroups.map(group => group.reference),
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

  stubUpdateSessionTemplate: ({ sessionTemplate }: { sessionTemplate: SessionTemplate }): SuperAgentRequest => {
    return stubFor({
      request: {
        method: 'PUT',
        url: `/visitScheduler/admin/session-templates/template/${sessionTemplate.reference}`,
        bodyPatterns: [
          {
            equalToJson: {
              name: sessionTemplate.name,
              sessionCapacity: sessionTemplate.sessionCapacity,
              sessionDateRange: sessionTemplate.sessionDateRange,
              visitRoom: sessionTemplate.visitRoom,
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
    // default to today's date - yyyy-mm-dd
    requestVisitStatsDto = { visitsFromDate: format(new Date(), 'yyyy-MM-dd') },
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
