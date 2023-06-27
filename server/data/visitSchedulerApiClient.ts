import RestClient from './restClient'
import config from '../config'
import { CreateSessionTemplateDto, Prison, SessionTemplate, SessionTemplatesRangeType } from './visitSchedulerApiTypes'

export default class VisitSchedulerApiClient {
  private restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('visitSchedulerApiClient', config.apis.visitScheduler, token)
  }

  async getAllPrisons(): Promise<Prison[]> {
    return this.restClient.get({
      path: '/admin/prisons',
    })
  }

  async getPrison(prisonId: string): Promise<Prison> {
    return this.restClient.get({
      path: `/admin/prisons/prison/${prisonId}`,
    })
  }

  async createPrison(prison: Prison): Promise<Prison> {
    return this.restClient.post({
      path: '/admin/prisons/prison',
      data: <Prison>{
        active: prison.active,
        code: prison.code,
        excludeDates: prison.excludeDates,
      },
    })
  }

  async activatePrison(prisonCode: string): Promise<Prison> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/activate`,
    })
  }

  async deactivatePrison(prisonCode: string): Promise<Prison> {
    return this.restClient.put({
      path: `/admin/prisons/prison/${prisonCode}/deactivate`,
    })
  }

  // Session template controller
  async getSessionTemplates(prisonCode: string, rangeType: SessionTemplatesRangeType): Promise<SessionTemplate[]> {
    return this.restClient.get({
      path: `/admin/session-templates`,
      query: new URLSearchParams({
        prisonCode,
        rangeType,
      }).toString(),
    })
  }

  async getSingleSessionTemplate(reference: string): Promise<SessionTemplate> {
    return this.restClient.get({
      path: `/admin/session-templates/template/${reference}`,
    })
  }

  async createSessionTemplate(sessionTemplate: CreateSessionTemplateDto): Promise<CreateSessionTemplateDto> {
    return this.restClient.post({
      path: `/admin/session-templates/template`,
      data: <CreateSessionTemplateDto>{
        name: sessionTemplate.name,
        weeklyFrequency: sessionTemplate.weeklyFrequency,
        dayOfWeek: sessionTemplate.dayOfWeek,
        prisonId: sessionTemplate.prisonId,
        sessionCapacity: sessionTemplate.sessionCapacity,
        sessionDateRange: sessionTemplate.sessionDateRange,
        sessionTimeSlot: sessionTemplate.sessionTimeSlot,
        visitRoom: sessionTemplate.visitRoom,
        categoryGroupReferences: [],
        incentiveLevelGroupReferences: [],
        locationGroupReferences: [],
      },
    })
  }
}
